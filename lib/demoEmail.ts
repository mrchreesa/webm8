/**
 * The two emails a /free-demo/ request sends: the notification to WebM8 and the
 * confirmation to the visitor. Pure builders, so they can be tested; sending
 * is lib/resend.ts. Everything the visitor typed is escaped in the HTML.
 */

import { firstNameOf, type DemoSubmission } from "./demoRequest.ts";
import { trades } from "./trades.ts";

export type EmailContent = { subject: string; text: string; html: string };

/** The sender for both emails. Its domain must be verified in Resend. */
export const demoEmailFrom = "WebM8 <hello@webm8agency.com>";

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function tradeName(request: DemoSubmission): string {
  return request.trade === "other" && request.tradeOther ? request.tradeOther : trades[request.trade].short;
}

function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

const ATTRIBUTION_LABELS = [
  ["utm_source", "Source"],
  ["utm_medium", "Medium"],
  ["utm_campaign", "Campaign"],
  ["utm_content", "Ad"],
  ["utm_term", "Term"],
  ["campaign_id", "Campaign id"],
  ["adset_id", "Ad set id"],
  ["ad_id", "Ad id"],
  ["placement", "Placement"],
] as const;

const page = (body: string) =>
  `<!doctype html><html><body style="margin:0;padding:24px;background:#f8f5f0;font-family:Helvetica,Arial,sans-serif;color:#0e2f56;line-height:1.5">` +
  `<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">${body}</div></body></html>`;

export function demoNotificationEmail(
  request: DemoSubmission,
  { id, receivedAt }: { id: string; receivedAt: Date },
): EmailContent {
  const received = `${receivedAt.toISOString().slice(0, 16).replace("T", " ")} UTC`;
  const details: [string, string][] = [
    ["Business", request.business],
    ["Type of business", tradeName(request)],
    ...(request.link ? ([["Link", request.link]] as [string, string][]) : []),
    ["Name", request.name],
    ["Phone", request.phone],
    ["Email", request.email],
  ];
  const campaign = ATTRIBUTION_LABELS.flatMap(([key, label]) => {
    const value = request.attribution[key];
    return value ? ([[label, value]] as [string, string][]) : [];
  });

  const text = [
    "New Free Personalised Website Demo request from /free-demo/.",
    "",
    ...details.map(([label, value]) => `${label}: ${value}`),
    ...(campaign.length ? ["", ...campaign.map(([label, value]) => `${label}: ${value}`)] : []),
    "",
    `Request id: ${id}`,
    `Received: ${received}`,
    "",
    `We promised a call today. Reply to this email to write to ${firstNameOf(request.name) || "them"}.`,
  ].join("\n");

  const cell = (label: string, value: string) => {
    let shown = escapeHtml(value);
    if (label === "Phone") shown = `<a href="tel:${escapeHtml(value.replace(/[^\d+]/g, ""))}" style="color:#1b4a80">${shown}</a>`;
    if (label === "Email") shown = `<a href="mailto:${escapeHtml(value)}" style="color:#1b4a80">${shown}</a>`;
    if (label === "Link") shown = `<a href="${escapeHtml(value)}" style="color:#1b4a80">${shown}</a>`;
    return `<tr><td style="padding:6px 16px 6px 0;color:#5b6b7e;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600">${shown}</td></tr>`;
  };

  const html = page(
    `<p style="margin:0 0 4px;font-size:13px;color:#5b6b7e">New demo request</p>` +
      `<h1 style="margin:0 0 20px;font-size:24px;line-height:1.2">${escapeHtml(request.business)}</h1>` +
      `<table style="border-collapse:collapse;font-size:15px">${details.map(([label, value]) => cell(label, value)).join("")}</table>` +
      (campaign.length
        ? `<table style="border-collapse:collapse;font-size:13px;margin-top:18px">${campaign.map(([label, value]) => cell(label, value)).join("")}</table>`
        : "") +
      `<p style="margin:20px 0 0;font-size:13px;color:#5b6b7e">Request ${escapeHtml(id)}, received ${received}. We promised a call today.</p>`,
  );

  return {
    subject: `New demo request: ${request.business} (${tradeName(request)})`,
    text,
    html,
  };
}

const NEXT_STEPS: [string, (business: string) => string][] = [
  ["A quick call", () => "About five minutes, so we understand your business and what you want more of."],
  ["Your demo", (business) => `A homepage designed for ${business}, ready within 48 hours of our call. We show it to you on a short video call.`],
  ["You decide", () => "Love it? We'll recommend a plan based on the features you need. Not for you? Walk away. We won't chase."],
];

export function demoConfirmationEmail(
  request: DemoSubmission,
  { callFrom }: { callFrom?: string },
): EmailContent {
  const first = firstNameOf(request.name);
  const call = `We'll call you today about ${possessive(request.business)} free website demo, or first thing tomorrow if it's late.`;
  const from = callFrom ? `Our call will come from ${callFrom}.` : "";

  const text = [
    first ? `Thanks, ${first}.` : "Thanks.",
    "",
    call,
    ...(from ? [from] : []),
    "",
    "What happens next",
    ...NEXT_STEPS.map(([title, body], index) => `${index + 1}. ${title}. ${body(request.business)}`),
    "",
    "No payment. No obligation.",
    "",
    "Reply to this email if anything changes.",
    "",
    "WebM8",
    "webm8agency.com",
  ].join("\n");

  const html = page(
    `<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2">${first ? `Thanks, ${escapeHtml(first)}.` : "Thanks."}</h1>` +
      `<p style="margin:0 0 8px;font-size:16px">${escapeHtml(call)}</p>` +
      (from ? `<p style="margin:0 0 8px;font-size:16px">${escapeHtml(from)}</p>` : "") +
      `<h2 style="margin:24px 0 8px;font-size:17px">What happens next</h2>` +
      `<ol style="margin:0;padding-left:20px;font-size:15px">${NEXT_STEPS.map(
        ([title, body]) => `<li style="margin-bottom:8px"><strong>${title}.</strong> ${escapeHtml(body(request.business))}</li>`,
      ).join("")}</ol>` +
      `<p style="margin:20px 0 0;font-size:15px;font-weight:600">No payment. No obligation.</p>` +
      `<p style="margin:8px 0 0;font-size:15px">Reply to this email if anything changes.</p>` +
      `<p style="margin:24px 0 0;font-size:14px;color:#5b6b7e">WebM8 · <a href="https://webm8agency.com" style="color:#1b4a80">webm8agency.com</a></p>`,
  );

  return { subject: first ? `We've got your request, ${first}` : "We've got your request", text, html };
}
