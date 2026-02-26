import * as crypto from "node:crypto";

// reference: https://docs.slack.dev/authentication/verifying-requests-from-slack/
export function verifySlackRequest(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string,
): boolean {
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  // Reject requests older than 5 minutes to prevent replay attacks.
  // Even if an attacker captures a valid signed request, they cannot reuse it
  // after the 5-minute window has passed.
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    return false;
  }

  const expected =
    "v0=" +
    crypto
      .createHmac("sha256", signingSecret)
      .update(`v0:${timestamp}:${body}`, "utf8")
      .digest("hex");

  if (
    Buffer.byteLength(signature, "utf8") !== Buffer.byteLength(expected, "utf8")
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8"),
  );
}
