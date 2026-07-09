import { ActionError } from 'astro:actions';
import { getServerEnv } from './env';

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(token: string | undefined, request: Request): Promise<void> {
  const secret = getServerEnv('TURNSTILE_SECRET_KEY');

  if (!secret) {
    throw new ActionError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Contact verification is not configured yet.',
    });
  }

  if (!token) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Please complete the verification challenge.',
    });
  }

  const remoteIp = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim();
  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) body.set('remoteip', remoteIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new ActionError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Verification service is unavailable. Please try again later.',
    });
  }

  const result = await response.json<TurnstileResponse>();

  if (!result.success) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Verification failed. Please try again.',
    });
  }
}
