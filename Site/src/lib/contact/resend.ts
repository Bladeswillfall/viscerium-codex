import { ActionError } from 'astro:actions';
import { getServerEnv } from './env';

interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  reason: string;
  pageUrl?: string;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildPlainText(input: ContactEmailInput): string {
  return [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Reason: ${input.reason}`,
    input.pageUrl ? `Related page: ${input.pageUrl}` : undefined,
    '',
    'Message:',
    input.message,
  ].filter((line): line is string => typeof line === 'string').join('\n');
}

function buildHtml(input: ContactEmailInput): string {
  const pageUrl = input.pageUrl
    ? `<p><strong>Related page:</strong> <a href="${escapeHtml(input.pageUrl)}">${escapeHtml(input.pageUrl)}</a></p>`
    : '';

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #111;">
      <h1>New VISCERIUM Codex contact message</h1>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Reason:</strong> ${escapeHtml(input.reason)}</p>
      ${pageUrl}
      <hr />
      <div style="white-space: pre-wrap;">${escapeHtml(input.message)}</div>
    </div>
  `;
}

export async function sendContactEmail(input: ContactEmailInput): Promise<string | undefined> {
  const apiKey = getServerEnv('RESEND_API_KEY');
  const to = getServerEnv('CONTACT_TO_EMAIL');
  const from = getServerEnv('CONTACT_FROM_EMAIL') ?? 'VISCERIUM Codex <onboarding@resend.dev>';

  if (!apiKey || !to) {
    throw new ActionError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Contact email is not configured yet.',
    });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `VISCERIUM Codex: ${input.subject}`,
      text: buildPlainText(input),
      html: buildHtml(input),
      tags: [
        { name: 'source', value: 'viscerium-codex' },
        { name: 'reason', value: input.reason.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'general' },
      ],
    }),
  });

  const payload = await response.json().catch(() => undefined) as { id?: string; message?: string } | undefined;

  if (!response.ok) {
    throw new ActionError({
      code: 'INTERNAL_SERVER_ERROR',
      message: payload?.message ?? 'Unable to send the message right now. Please try again later.',
    });
  }

  return payload?.id;
}
