import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import { loadGeneratedDocs } from './content-manifest.mjs';
import { isMainModule } from './script-entry.mjs';

const outFile = path.resolve(process.cwd(), 'src/data/maps.json');

export async function generateMapData({ manifest } = {}) {
  const docs = manifest ?? await loadGeneratedDocs();
  const maps = {};

  for (const record of docs.records) {
    const id = record.relativePath.replace(/\.(md|mdx)$/i, '');
    const { data } = record;
    if (data.type === 'map' && data.mapId) {
      maps[data.mapId] = {
        id: data.mapId,
        title: data.title,
        description: data.description,
        image: data.image,
        width: data.width,
        height: data.height,
        page: `/${id}/`,
        markers: [],
      };
    }
  }

  for (const record of docs.records) {
    const id = record.relativePath.replace(/\.(md|mdx)$/i, '');
    const { data } = record;
    if (data.map?.id) {
      maps[data.map.id] ??= { id: data.map.id, title: data.map.id, description: '', markers: [] };
      maps[data.map.id].markers.push({
        title: data.title,
        description: data.description,
        x: data.map.x,
        y: data.map.y,
        marker: data.map.marker,
        layer: data.map.layer,
        page: `/${id}/`,
      });
    }
  }

  await fs.ensureDir(path.dirname(outFile));
  await fs.writeJson(outFile, maps, { spaces: 2 });
  console.log(`Generated ${Object.keys(maps).length} map data set(s).`);
  return maps;
}

if (isMainModule(import.meta.url)) await generateMapData();
