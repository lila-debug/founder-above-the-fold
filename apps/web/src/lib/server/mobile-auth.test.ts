import assert from "node:assert/strict";
import test from "node:test";
import { generateOpaqueToken, hashMobileToken, readBearerToken } from "./mobile-auth";

test("native tokens are random, typed, and only persisted as stable hashes", () => {
  const first = generateOpaqueToken("access");
  const second = generateOpaqueToken("access");
  assert.match(first, /^fat_access_[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
  assert.equal(hashMobileToken(first), hashMobileToken(first));
  assert.notEqual(hashMobileToken(first), first);
});

test("bearer parser rejects malformed authorization values", () => {
  assert.equal(readBearerToken("Bearer token-1"), "token-1");
  assert.equal(readBearerToken("bearer token-2"), "token-2");
  assert.equal(readBearerToken("Basic token-1"), null);
  assert.equal(readBearerToken("Bearer one two"), null);
  assert.equal(readBearerToken(null), null);
});
