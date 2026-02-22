import { createHmac } from "node:crypto";

export function verifySlackRequest(
  signingSecret: string,
  headers: Record<string, string>,
  body: string,
): boolean {
  const timestamp = headers["x-slack-request-timestamp"];
  const signature = headers["x-slack-signature"];

  if (!timestamp || !signature) {
    return false;
  }

  const time = Number.parseInt(timestamp, 10);
  if (Number.isNaN(time) || Math.abs(Date.now() / 1000 - time) > 300) {
    return false;
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${createHmac("sha256", signingSecret).update(sigBasestring).digest("hex")}`;

  return mySignature === signature;
}
