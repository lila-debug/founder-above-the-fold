import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const TOKEN_CIPHER_PREFIX = "v1";
const TOKEN_CIPHER_ALGORITHM = "aes-256-gcm";
const TOKEN_IV_BYTES = 12;

export function encryptToken(plainText: string) {
  const iv = randomBytes(TOKEN_IV_BYTES);
  const cipher = createCipheriv(TOKEN_CIPHER_ALGORITHM, getTokenEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    TOKEN_CIPHER_PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptToken(cipherText: string) {
  const [version, encodedIv, encodedTag, encodedEncrypted] = cipherText.split(":");

  if (
    version !== TOKEN_CIPHER_PREFIX ||
    !encodedIv ||
    !encodedTag ||
    !encodedEncrypted
  ) {
    throw new Error("Stored token has an unsupported encryption format.");
  }

  const decipher = createDecipheriv(
    TOKEN_CIPHER_ALGORITHM,
    getTokenEncryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedEncrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function getTokenEncryptionKey() {
  const secret = process.env.TOKEN_ENCRYPTION_KEY?.trim();

  if (!secret) {
    throw new Error("TOKEN_ENCRYPTION_KEY is required.");
  }

  if (secret.length < 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be at least 32 characters.");
  }

  return createHash("sha256").update(secret).digest();
}
