import type { InstantMarket } from "./instantPricing.ts";
import type { Answers } from "./instantWebsite.ts";
import { createHmac } from "node:crypto";

export type InstantCrmBilling = {
  market?: InstantMarket;
  orderId: string;
  customerId: string;
  subscriptionId: string;
  status: "trialing" | "active";
  trialEnd: string;
  livemode: boolean;
};
export type InstantCrmOptions = { url?: string; secret?: string; fetcher?: typeof fetch };

/** Complete website brief, with private delivery and public website contacts kept separate. */
export function instantCrmSubmission(a: Answers, billing: InstantCrmBilling) {
  return {
    formType: "instant" as const,
    submissionKey: billing.orderId,
    siteId: "ea003967-7c28-47a1-a4a8-6b0b2713879c",
    sourceUrl: "https://instant.webm8agency.com/",
    name: a.name, business: a.businessName, email: a.email, phone: a.deliveryPhone,
    area: a.area, link: a.hasWebsite === "yes" ? a.website || null : null,
    billing: { market: billing.market ?? "GB", customerId: billing.customerId, subscriptionId: billing.subscriptionId, status: billing.status, trialEnd: billing.trialEnd, livemode: billing.livemode },
    brief: {
      industry: a.industry, hasWebsite: a.hasWebsite, links: a.links.filter(Boolean), services: a.services, contacts: a.contacts,
      publicPhone: a.contacts.includes("phone") ? a.phone : "",
      publicWhatsapp: a.contacts.includes("whatsapp") ? a.samePhone && a.contacts.includes("phone") ? a.phone : a.whatsapp : "",
      enquiryEmail: a.contacts.some(c => ["email", "request"].includes(c)) || (a.contacts.includes("booking") && a.bookingLater) ? a.enquiryEmail : "",
      bookingUrl: a.contacts.includes("booking") && !a.bookingLater ? a.bookingUrl : "",
      bookingLater: a.contacts.includes("booking") && a.bookingLater,
      difference: a.difference, colours: a.colours, notes: a.notes,
      address: a.address, hours: a.hours, menuUrl: a.industry === "food" ? a.menuUrl : "",
    },
  };
}

/** Success requires the CRM's durable receipt; never log contact data or credentials. */
export async function saveInstantToCrm(a: Answers, billing: InstantCrmBilling, {
  url = process.env.CRM_WEBSITE_INTAKE_URL,
  secret = process.env.WEBSITE_INTAKE_SECRET,
  fetcher = fetch,
}: InstantCrmOptions = {}): Promise<{ id: string; duplicate: boolean }> {
  if (!url || !secret || secret.length < 32) throw new Error("CRM website intake is not configured");
  const endpoint = new URL(url);
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash)
    throw new Error("CRM website intake requires a secure endpoint");
  const body = JSON.stringify(instantCrmSubmission(a, billing));
  if (Buffer.byteLength(body, "utf8") > 32 * 1024) throw new Error("Website brief exceeds the CRM intake limit");
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  const response = await fetcher(endpoint, {
    method: "POST", headers: { "Content-Type": "application/json", "x-webm8-signature-256": `sha256=${signature}` },
    body, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`CRM website intake failed with ${response.status}`);
  const receipt = await response.json() as { ok?: boolean; id?: string; duplicate?: boolean };
  if (receipt.ok !== true || typeof receipt.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(receipt.id) || typeof receipt.duplicate !== "boolean")
    throw new Error("CRM website intake returned an invalid receipt");
  return { id: receipt.id, duplicate: receipt.duplicate };
}
