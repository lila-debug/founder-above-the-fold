import {
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from "node:crypto";
import { getRequiredEnv } from "./env";
import { getDbPool } from "./db";

type ReceiptPayload = {
  version: 1;
  licenceId: string;
  deviceHash: string;
  majorVersion: number;
  issuedAt: number;
  refreshAfter: number;
  expiresAt: number;
};

export async function activateLicenceDevice(input: {
  recoveryToken: string;
  deviceId: string;
  deviceLabel: string;
}) {
  const recoveryToken = normalizeRecoveryToken(input.recoveryToken);
  const deviceId = normalizeDeviceId(input.deviceId);
  const deviceLabel = normalizeDeviceLabel(input.deviceLabel);
  const config = getLicenceReceiptConfig();
  const deviceHash = createHmac("sha256", config.deviceHashSecret)
    .update(deviceId)
    .digest("hex");
  const client = await getDbPool().connect();
  try {
    await client.query("begin");
    const recovery = await client.query<{
      licence_id: string;
      major_version: number;
      device_allowance: number;
    }>(
      `select licence.id as licence_id, licence.major_version, licence.device_allowance
       from licence_recovery_requests request
       join founder_licences licence on licence.id = request.licence_id
       where request.token_hash = $1
         and request.expires_at > now()
         and licence.status = 'active'
       for update of licence`,
      [sha256Hex(recoveryToken)],
    );
    const licence = recovery.rows[0];
    if (!licence) throw new Error("The recovery handle is invalid, expired, or inactive.");

    const existing = await client.query<{ id: string }>(
      `select id from founder_licence_devices
       where licence_id = $1 and device_hash = $2 and revoked_at is null`,
      [licence.licence_id, deviceHash],
    );
    if (!existing.rows[0]) {
      const activeDevices = await client.query<{ count: number }>(
        `select count(*)::int as count from founder_licence_devices
         where licence_id = $1 and revoked_at is null`,
        [licence.licence_id],
      );
      if ((activeDevices.rows[0]?.count ?? 0) >= licence.device_allowance) {
        throw new Error("The licence device allowance is already fitted.");
      }
      await client.query(
        `insert into founder_licence_devices
           (licence_id, device_hash, device_label)
         values ($1, $2, $3)`,
        [licence.licence_id, deviceHash, deviceLabel],
      );
    } else {
      await client.query(
        `update founder_licence_devices
         set device_label = $3, last_verified_at = now()
         where licence_id = $1 and device_hash = $2 and revoked_at is null`,
        [licence.licence_id, deviceHash, deviceLabel],
      );
    }
    await client.query(
      `update licence_recovery_requests set opened_at = coalesce(opened_at, now())
       where token_hash = $1`,
      [sha256Hex(recoveryToken)],
    );
    await client.query("commit");

    return {
      activated: true as const,
      receipt: signReceipt({
        licenceId: licence.licence_id,
        deviceHash,
        majorVersion: licence.major_version,
      }, config.privateKey),
      majorVersion: licence.major_version,
      refreshDays: 7,
      offlineDays: 30,
    };
  } catch (cause) {
    await client.query("rollback");
    throw cause;
  } finally {
    client.release();
  }
}

export async function verifyLicenceReceipt(receipt: string) {
  const config = getLicenceReceiptConfig();
  const payload = parseAndVerifyReceipt(receipt, config.publicKey);
  if (!payload) return { valid: false as const, state: "invalid" as const };
  const now = Math.floor(Date.now() / 1000);
  if (payload.expiresAt <= now) return { valid: false as const, state: "expired" as const };

  const result = await getDbPool().query<{
    licence_status: "active" | "refunded" | "disputed" | "revoked";
    device_revoked_at: Date | null;
    major_version: number;
  }>(
    `update founder_licence_devices device
     set last_verified_at = now()
     from founder_licences licence
     where device.licence_id = $1
       and device.device_hash = $2
       and licence.id = device.licence_id
     returning licence.status as licence_status,
               device.revoked_at as device_revoked_at,
               licence.major_version`,
    [payload.licenceId, payload.deviceHash],
  );
  const row = result.rows[0];
  if (!row || row.licence_status !== "active" || row.device_revoked_at) {
    return { valid: false as const, state: "inactive" as const };
  }

  return {
    valid: true as const,
    state: "active" as const,
    majorVersion: row.major_version,
    receipt: signReceipt({
      licenceId: payload.licenceId,
      deviceHash: payload.deviceHash,
      majorVersion: row.major_version,
    }, config.privateKey),
    refreshDays: 7,
    offlineDays: 30,
  };
}

export function getLicenceReceiptConfig() {
  const deviceHashSecret = getRequiredEnv("LICENCE_DEVICE_HASH_SECRET");
  if (Buffer.byteLength(deviceHashSecret) < 32) {
    throw new Error("LICENCE_DEVICE_HASH_SECRET must contain at least 32 bytes.");
  }
  try {
    const privateKey = createPrivateKey({
      key: Buffer.from(getRequiredEnv("LICENCE_SIGNING_PRIVATE_KEY"), "base64"),
      format: "der",
      type: "pkcs8",
    });
    const publicKey = createPublicKey({
      key: Buffer.from(getRequiredEnv("LICENCE_SIGNING_PUBLIC_KEY"), "base64"),
      format: "der",
      type: "spki",
    });
    const probe = Buffer.from("founder-above-the-fold-licence-keypair");
    const signature = sign(null, probe, privateKey);
    if (!verify(null, probe, publicKey, signature)) {
      throw new Error("keypair mismatch");
    }
    return { deviceHashSecret, privateKey, publicKey };
  } catch {
    throw new Error("The Ed25519 licence signing keypair is invalid or mismatched.");
  }
}

function signReceipt(
  input: { licenceId: string; deviceHash: string; majorVersion: number },
  privateKey: ReturnType<typeof createPrivateKey>,
) {
  const now = Math.floor(Date.now() / 1000);
  const payload: ReceiptPayload = {
    version: 1,
    licenceId: input.licenceId,
    deviceHash: input.deviceHash,
    majorVersion: input.majorVersion,
    issuedAt: now,
    refreshAfter: now + 7 * 24 * 60 * 60,
    expiresAt: now + 30 * 24 * 60 * 60,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(null, Buffer.from(encoded), privateKey).toString("base64url");
  return `${encoded}.${signature}`;
}

function parseAndVerifyReceipt(
  receipt: string,
  publicKey: ReturnType<typeof createPublicKey>,
) {
  const [encoded, signatureText, extra] = receipt.trim().split(".");
  if (!encoded || !signatureText || extra || encoded.length > 2000 || signatureText.length > 300) return null;
  try {
    const signature = Buffer.from(signatureText, "base64url");
    if (!verify(null, Buffer.from(encoded), publicKey, signature)) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ReceiptPayload;
    if (
      payload.version !== 1 ||
      !/^[0-9a-f-]{36}$/.test(payload.licenceId) ||
      !/^[a-f0-9]{64}$/.test(payload.deviceHash) ||
      !Number.isInteger(payload.majorVersion) ||
      !Number.isInteger(payload.issuedAt) ||
      !Number.isInteger(payload.refreshAfter) ||
      !Number.isInteger(payload.expiresAt)
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

function normalizeRecoveryToken(value: string) {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(normalized)) {
    throw new Error("The recovery handle is invalid or expired.");
  }
  return normalized;
}

function normalizeDeviceId(value: string) {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9._:-]{16,200}$/.test(normalized)) {
    throw new Error("The device fastener is invalid.");
  }
  return normalized;
}

function normalizeDeviceLabel(value: string) {
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().replace(/\s+/g, " ");
  if (normalized.length < 1 || normalized.length > 80) {
    throw new Error("The device label must contain 1 to 80 characters.");
  }
  return normalized;
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
