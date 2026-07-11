import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import sharp from 'sharp';
import siteConfig from '../site.config.mjs';
import { loadGeneratedDocs } from './content-manifest.mjs';
import { isMainModule } from './script-entry.mjs';

const siteRoot = process.cwd();
const registryPath = path.resolve(siteRoot, 'src/data/contributors.json');
const cacheDir = path.resolve(siteRoot, siteConfig.vaultAssetDir, 'Contributors');
const publicDir = path.resolve(siteRoot, 'public/assets/contributors');

function normaliseContributor(item) {
  if (typeof item === 'string') return { id: item.trim().toLowerCase() };
  if (!item || typeof item !== 'object' || typeof item.id !== 'string') return null;
  return { ...item, id: item.id.trim().toLowerCase() };
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';
}

function placeholderSvg(profile) {
  const label = initials(profile.name);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" role="img" aria-label="${profile.name}">
  <rect width="192" height="192" rx="96" fill="#24242a"/>
  <circle cx="96" cy="96" r="91" fill="none" stroke="#9b8cff" stroke-width="6"/>
  <text x="96" y="113" text-anchor="middle" fill="#f5f3ff" font-family="system-ui, sans-serif" font-size="62" font-weight="700">${label}</text>
</svg>`);
}

function validateRegistry(registry, manifest) {
  const profiles = registry.profiles ?? {};
  let failed = false;
  const defaultEntries = Array.isArray(registry.defaultContributors) ? registry.defaultContributors : [];

  for (const item of defaultEntries) {
    const contributor = normaliseContributor(item);
    if (!contributor || !profiles[contributor.id]) {
      console.error(`Unknown default contributor id: ${contributor?.id ?? JSON.stringify(item)}`);
      failed = true;
    }
  }

  for (const [id, profile] of Object.entries(profiles)) {
    if (!profile?.name || !profile?.github || !profile?.avatar) {
      console.error(`Contributor profile "${id}" must define name, github, and avatar.`);
      failed = true;
      continue;
    }
    if (!String(profile.avatar).toLowerCase().endsWith('.webp')) {
      console.error(`Contributor profile "${id}" must use a .webp avatar filename.`);
      failed = true;
    }
  }

  for (const record of manifest.records) {
    const contributors = Array.isArray(record.data.contributors) ? record.data.contributors : [];
    for (const item of contributors) {
      const contributor = normaliseContributor(item);
      if (!contributor || !profiles[contributor.id]) {
        console.error(`Unknown contributor id in ${record.relativePath}: ${contributor?.id ?? JSON.stringify(item)}`);
        failed = true;
      }
    }
  }

  return !failed;
}

async function refreshAvatar(id, profile, shouldRefresh) {
  const filename = path.basename(profile.avatar);
  const cachePath = path.join(cacheDir, filename);
  const publicPath = path.join(publicDir, filename);
  const temporaryPath = `${cachePath}.tmp`;
  let refreshed = false;

  if (shouldRefresh) {
    try {
      const response = await fetch(`https://github.com/${encodeURIComponent(profile.github)}.png?size=192`, {
        redirect: 'follow',
        headers: {
          accept: 'image/avif,image/webp,image/png,image/jpeg,*/*',
          'user-agent': 'VISCERIUM-Codex-avatar-sync',
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const input = Buffer.from(await response.arrayBuffer());
      await sharp(input)
        .resize(192, 192, { fit: 'cover', position: 'centre' })
        .webp({ quality: 88, effort: 5 })
        .toFile(temporaryPath);
      await fs.move(temporaryPath, cachePath, { overwrite: true });
      refreshed = true;
    } catch (error) {
      await fs.remove(temporaryPath);
      console.warn(`Could not refresh avatar for ${id}: ${error.message}`);
    }
  }

  if (!(await fs.pathExists(cachePath))) {
    await sharp(placeholderSvg(profile))
      .resize(192, 192)
      .webp({ quality: 88, effort: 5 })
      .toFile(cachePath);
    console.warn(`Created a local placeholder avatar for ${id}.`);
  }

  await fs.copy(cachePath, publicPath, { overwrite: true });
  console.log(`${refreshed ? 'Refreshed' : 'Copied cached'} contributor avatar ${filename}.`);
}

export async function syncContributorAvatars({ manifest, shouldRefresh = process.env.CODEX_SKIP_AVATAR_REFRESH !== '1' } = {}) {
  const docs = manifest ?? await loadGeneratedDocs();
  const registry = await fs.readJson(registryPath);
  const profiles = registry.profiles ?? {};

  if (!validateRegistry(registry, docs)) throw new Error('Contributor registry validation failed.');

  await fs.ensureDir(cacheDir);
  await fs.ensureDir(publicDir);
  for (const [id, profile] of Object.entries(profiles)) {
    await refreshAvatar(id, profile, shouldRefresh);
  }

  console.log(`Synced ${Object.keys(profiles).length} contributor avatar${Object.keys(profiles).length === 1 ? '' : 's'} as WebP.`);
}

if (isMainModule(import.meta.url)) {
  try {
    await syncContributorAvatars();
  } catch (error) {
    console.error(error.message ?? error);
    process.exitCode = 1;
  }
}
