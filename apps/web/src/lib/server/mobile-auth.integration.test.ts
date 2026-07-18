import assert from "node:assert/strict";
import test, { after } from "node:test";
import {
  consumeMobileLinkedInFlow,
  createMobileLinkedInFlow,
  createMobileMagicLink,
  exchangeMobileMagicLink,
  readMobileSession,
  revokeMobileSession,
  rotateMobileSession,
} from "./mobile-auth";
import { getDbPool } from "./db";

const databaseURL = process.env.DATABASE_URL ?? "";
if (!/(localhost|127\.0\.0\.1)/.test(databaseURL)) {
  throw new Error("Mobile auth integration tests require disposable local Postgres.");
}

after(async () => {
  await getDbPool().query("delete from mobile_magic_links where owner_email = $1", ["mobile-test@example.com"]);
  await getDbPool().query("delete from mobile_sessions where owner_email = $1", ["mobile-test@example.com"]);
  await getDbPool().end();
  globalThis.dispatchPgPool = undefined;
});

test("one-use link, rotating session, OAuth state and revocation lock together", async () => {
  const email = "mobile-test@example.com";
  const link = await createMobileMagicLink(email);
  const issued = await exchangeMobileMagicLink({ token: link, deviceName: "Test iPhone" });
  assert.equal(issued.session.email, email);
  assert.equal(issued.session.deviceName, "Test iPhone");
  assert.equal((await readMobileSession(issued.tokens.accessToken))?.id, issued.session.id);

  await assert.rejects(() => exchangeMobileMagicLink({ token: link }), /already used/);

  const rotated = await rotateMobileSession(issued.tokens.refreshToken);
  assert.equal(await readMobileSession(issued.tokens.accessToken), null);
  await assert.rejects(() => rotateMobileSession(issued.tokens.refreshToken), /Sign in again/);
  assert.equal((await readMobileSession(rotated.accessToken))?.id, issued.session.id);

  const oauthState = await createMobileLinkedInFlow(rotated.accessToken);
  assert.equal(await consumeMobileLinkedInFlow(oauthState), email);
  assert.equal(await consumeMobileLinkedInFlow(oauthState), null);

  assert.equal(await revokeMobileSession({ refreshToken: rotated.refreshToken }), true);
  assert.equal(await readMobileSession(rotated.accessToken), null);
});
