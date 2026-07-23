import fs from 'node:fs/promises';
import process from 'node:process';
import { loadGeneratedDocs, loadVaultContent } from './content-manifest.mjs';
import { validateRepositoryImages } from './validate-vault-assets.mjs';
import { validateVaultNotes } from './validate-vault-notes.mjs';
import { generateTimelineData, reportTimelineError } from './generate-timeline-data.mjs';
import { validateGeneratedContent } from './validate-content.mjs';
import { generateMapData } from './generate-map-data.mjs';
import { generateRelationshipData } from './generate-relationship-data.mjs';

const modeArgument = process.argv.find((value) => value.startsWith('--mode='));
const mode = modeArgument?.slice('--mode='.length) || 'build';
const validModes = new Set(['sync', 'dev', 'build']);

async function syncShellAssets() {
  const noiseSource = new URL('../src/assets/images/codex-noise.webp.b64.txt', import.meta.url);
  const noiseTargetDir = new URL('../public/assets/images/', import.meta.url);
  const noiseTarget = new URL('../public/assets/images/codex-noise-v2.webp', import.meta.url);
  const encoded = (await fs.readFile(noiseSource, 'utf8')).trim();
  const decoded = Buffer.from(encoded, 'base64');

  const isWebp = decoded.subarray(0, 4).toString('ascii') === 'RIFF'
    && decoded.subarray(8, 12).toString('ascii') === 'WEBP';
  if (!isWebp) throw new Error('Codex noise source did not decode to a valid WebP asset.');

  await fs.mkdir(noiseTargetDir, { recursive: true });
  await fs.writeFile(noiseTarget, decoded);
}

if (!validModes.has(mode)) {
  console.error(`Unknown content build mode "${mode}". Expected sync, dev, or build.`);
  process.exitCode = 1;
} else {
  try {
    await syncShellAssets();

    const vault = await loadVaultContent({ refresh: true });
    if (!validateVaultNotes(vault)) throw new Error('Vault source validation failed.');
    if (!(await validateRepositoryImages())) throw new Error('Repository image policy failed.');

    await generateTimelineData({
      manifest: vault,
      validateOnly: mode === 'sync',
    });

    await import('./sync-public-notes.mjs');
    await import('./transform-timeline-shortcodes.mjs');
    await import('./generate-category-pages.mjs');

    const docs = await loadGeneratedDocs({ refresh: true });
    if (mode === 'build' && !validateGeneratedContent(docs)) {
      throw new Error('Generated content validation failed.');
    }

    if (mode !== 'sync') {
      await generateMapData({ manifest: docs });
      await generateRelationshipData({ manifest: docs });
    }

    console.log(`Completed shared content pipeline in ${mode} mode.`);
  } catch (error) {
    if (!reportTimelineError(error)) console.error(error.message ?? error);
    process.exitCode = 1;
  }
}
