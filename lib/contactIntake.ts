import { validateContactSubmission } from "./contactRequest.ts";
import { saveDemoToCrm } from "./crmIntake.ts";
import { contactEmails } from "./contactEmail.ts";
import { sendEmail } from "./resend.ts";

/** Save first. Email delivery is supplementary and cannot undo a saved enquiry. */
export async function acceptContact(
  input: unknown,
  dependencies = { save: saveDemoToCrm, send: sendEmail },
) {
  const validation = validateContactSubmission(input);
  if (!validation.ok)
    return { status: 400, body: { ok: false, errors: validation.errors } };
  const enquiry = validation.value;
  let receipt;
  try {
    receipt = await dependencies.save(enquiry);
  } catch {
    return {
      status: 502,
      body: {
        ok: false,
        errors: {
          form: "We couldn't confirm your enquiry was saved. Your answers are still here. Please try again, or email info@webm8agency.com.",
        },
      },
    };
  }
  if (receipt.duplicate)
    return { status: 200, body: { ok: true, id: receipt.id } };
  const messages = contactEmails(enquiry, receipt.id);
  const results = await Promise.allSettled([
    dependencies.send({
      from: "WebM8 <hello@webm8agency.com>",
      to: "info@webm8agency.com",
      replyTo: enquiry.email,
      ...messages.notification,
    }),
    dependencies.send({
      from: "WebM8 <hello@webm8agency.com>",
      to: enquiry.email,
      replyTo: "info@webm8agency.com",
      ...messages.confirmation,
    }),
  ]);
  results.forEach((result, index) => {
    if (result.status === "rejected" || !result.value.ok)
      console.error(
        `contact-request: email ${index} not sent for ${receipt.id}`,
      );
  });
  return { status: 200, body: { ok: true, id: receipt.id } };
}
