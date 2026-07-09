import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { getContactVerificationProvider } from '../lib/contact/env';
import { sendContactEmail } from '../lib/contact/resend';
import { verifyTurnstileToken } from '../lib/contact/turnstile';

const contactReasonValues = ['general', 'collaboration', 'rights', 'technical', 'lore', 'other'] as const;

function optionalTrimmedString(maxLength: number) {
  return z.preprocess((value) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }, z.string().max(maxLength).optional());
}

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().url('Enter a valid URL, including https://').max(500).optional());

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().trim().min(2, 'Enter your name.').max(120, 'Name is too long.'),
      email: z.string().trim().email('Enter a valid email address.').max(254, 'Email is too long.'),
      subject: z.string().trim().min(3, 'Enter a subject.').max(160, 'Subject is too long.'),
      reason: z.enum(contactReasonValues),
      pageUrl: optionalUrl,
      message: z.string().trim().min(10, 'Enter a message.').max(5000, 'Message is too long.'),
      consent: z.boolean().refine((value) => value, 'Confirm that you are happy to receive a reply by email.'),
      companyWebsite: optionalTrimmedString(250),
      'cf-turnstile-response': optionalTrimmedString(4096),
    }),
    handler: async (input, context) => {
      if (input.companyWebsite) {
        return {
          ok: true,
          message: 'Thanks, your message has been received.',
        };
      }

      if (getContactVerificationProvider() === 'turnstile') {
        await verifyTurnstileToken(input['cf-turnstile-response'], context.request);
      }

      const resendId = await sendContactEmail({
        name: input.name,
        email: input.email,
        subject: input.subject,
        reason: input.reason,
        pageUrl: input.pageUrl,
        message: input.message,
      });

      if (!resendId) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Message sent but no delivery id was returned.',
        });
      }

      return {
        ok: true,
        message: 'Thanks, your message has been sent.',
      };
    },
  }),
};
