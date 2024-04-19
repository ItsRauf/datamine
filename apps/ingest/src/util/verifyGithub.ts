import { createHmac, timingSafeEqual } from "node:crypto";

if (!process.env.GITHUB_WEBHOOK_SECRET) {
  throw new Error("GITHUB_WEBHOOK_SECRET is not defined");
}

export function verifyGithub(signature: string, body: object): boolean {
  const verify = createHmac(
    "sha256",
    // biome-ignore lint/style/noNonNullAssertion: check is ran before the function
    process.env.GITHUB_WEBHOOK_SECRET!,
  )
    .update(JSON.stringify(body))
    .digest("hex");
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${verify}`),
  );
}
