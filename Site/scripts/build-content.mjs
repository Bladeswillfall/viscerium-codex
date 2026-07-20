import process from 'node:process';
import { loadGeneratedDocs, loadVaultContent } from './content-manifest.mjs';
import { validateVaultAssets } from './validate-vault-assets.mjs';
import { validateVaultNotes } from './validate-vault-notes.mjs';
import { generateTimelineData, reportTimelineError } from './generate-timeline-data.mjs';
import { validateGeneratedContent } from './validate-content.mjs';
import { generateMapData } from './generate-map-data.mjs';

const modeArgument = process.argv.find((value) => value.startsWith('--mode='));
const mode = modeArgument?.slice('--mode='.length) || 'build';
const validModes = new Set(['sync', 'dev', 'build']);

if (!validModes.has(mode)) {
  console.error(`Unknown content build mode "${mode}". Expected sync, dev, or build.`);
  process.exitCode = 1;
} else {
  try {
    const vault = await loadVaultContent({ refresh: true });
    if (!validateVaultNotes(vault)) throw new Error('Vault source validation failed.');
    if (!(await validateVaultAssets())) throw new Error('Vault asset validation failed.');

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

    if (mode === 'build') {
      await generateMapData({ manifest: docs });
    }

    console.log(`Completed shared content pipeline in ${mode} mode.`);
  } catch (error) {
    if (!reportTimelineError(error)) console.error(error.message ?? error);
    process.exitCode = 1;
  }
}
