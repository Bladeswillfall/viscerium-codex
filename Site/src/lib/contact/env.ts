import { env as cloudflareEnv } from 'cloudflare:workers';

type EnvMap = Record<string, string | undefined>;

function normalizeEnvValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getServerEnv(name: string): string | undefined {
  const workerValue = normalizeEnvValue((cloudflareEnv as EnvMap | undefined)?.[name]);
  const viteValue = normalizeEnvValue((import.meta.env as EnvMap)[name]);
  return workerValue ?? viteValue;
}

export function getContactVerificationProvider(): 'turnstile' | 'none' {
  const configured = getServerEnv('CONTACT_VERIFICATION_PROVIDER')?.toLowerCase();
  if (configured === 'none') return 'none';
  if (configured === 'turnstile') return 'turnstile';
  return getServerEnv('TURNSTILE_SECRET_KEY') ? 'turnstile' : 'none';
}
