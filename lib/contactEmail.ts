import { contactPlans, type ContactSubmission } from "./contactRequest.ts";
import { escapeHtml } from "./demoEmail.ts";

export function contactEmails(request: ContactSubmission, id: string) {
  const text = [
    "New website enquiry from /contact/.",
    "",
    `Business: ${request.business}`,
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Phone: ${request.phone}`,
    `Plan: ${contactPlans[request.plan]}`,
    `Website: ${request.link || "Not provided"}`,
    "",
    request.message || "No message provided.",
    "",
    `CRM request: ${id}`,
    "Reply within one business day.",
  ].join("\n");
  const confirmation = `Hi ${request.name},\n\nThanks for contacting WebM8 about ${request.business}. We've received your enquiry and will reply within one business day.\n\nYou can reply to this email if you'd like to add anything.\n\nWebM8`;
  const html = (body: string) =>
    `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0e2f56;line-height:1.6"><p>${escapeHtml(body).replace(/\n/g, "<br>")}</p></body></html>`;
  return {
    notification: {
      subject: `Website enquiry: ${request.business.replace(/[\r\n]/g, " ")}`,
      text,
      html: html(text),
    },
    confirmation: {
      subject: "We've received your enquiry | WebM8",
      text: confirmation,
      html: html(confirmation),
    },
  };
}
