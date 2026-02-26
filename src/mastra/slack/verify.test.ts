import * as crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifySlackRequest } from "./verify.js";

const SECRET = "test-signing-secret";

function makeSignature(secret: string, timestamp: string, body: string) {
  return (
    "v0=" +
    crypto
      .createHmac("sha256", secret)
      .update(`v0:${timestamp}:${body}`, "utf8")
      .digest("hex")
  );
}

describe("verifySlackRequest", () => {
  const NOW_SEC = 1_700_000_000;
  const body = '{"type":"event_callback"}';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_SEC * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for a valid signature and timestamp", () => {
    const timestamp = String(NOW_SEC);
    const signature = makeSignature(SECRET, timestamp, body);

    expect(verifySlackRequest(SECRET, signature, timestamp, body)).toBe(true);
  });

  it("returns false for a tampered signature", () => {
    const timestamp = String(NOW_SEC);
    const signature =
      "v0=invalidsignature00000000000000000000000000000000000000000000000";

    expect(verifySlackRequest(SECRET, signature, timestamp, body)).toBe(false);
  });

  it("returns false for a timestamp older than 5 minutes (replay attack prevention)", () => {
    const oldTimestamp = String(NOW_SEC - 60 * 5 - 1);
    const signature = makeSignature(SECRET, oldTimestamp, body);

    expect(verifySlackRequest(SECRET, signature, oldTimestamp, body)).toBe(
      false,
    );
  });

  it("returns false when the signature length does not match", () => {
    const timestamp = String(NOW_SEC);
    const shortSignature = "v0=abc";

    expect(verifySlackRequest(SECRET, shortSignature, timestamp, body)).toBe(
      false,
    );
  });
});
