import { createHmac } from "node:crypto";
import type { DemoSubmission } from "./demoRequest.ts";

type IntakeOptions = { url?: string; secret?: string; fetcher?: typeof fetch };

/** Server-to-server only. A saved CRM record is the success condition. */
export async function saveDemoToCrm(
  demo: DemoSubmission,
  {
    url = process.env.CRM_WEBSITE_INTAKE_URL,
    secret = process.env.WEBSITE_INTAKE_SECRET,
    fetcher = fetch,
  }: IntakeOptions = {},
): Promise<{ id: string; duplicate: boolean }> {
  if (!url || !secret || secret.length < 32) throw new Error("CRM website intake is not configured");
  const endpoint = new URL(url);
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash)
    throw new Error("CRM website intake requires a secure endpoint");
  const body = JSON.stringify(demo);
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-webm8-signature-256": `sha256=${signature}` },
    body,
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`CRM website intake failed with ${response.status}`);
  const receipt = await response.json() as { ok?: boolean; id?: string; duplicate?: boolean };
  if (receipt.ok !== true || typeof receipt.id !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(receipt.id) || typeof receipt.duplicate !== "boolean")
    throw new Error("CRM website intake returned an invalid receipt");
  return { id: receipt.id, duplicate: receipt.duplicate };
}
