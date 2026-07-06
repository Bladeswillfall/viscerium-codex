import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';

const docsDir = path.resolve(process.cwd(), 'src/content/docs');
const files = await fg('**/*.{md,mdx}', { cwd: docsDir, absolute: true });
const required = ['title', 'description', 'slug', 'type'];
let failed = false;
for (const file of files) {
  const data = matter(await fs.readFile(file, 'utf8')).data;
  for (const field of required) {
    if (!data[field]) {
      console.error(`Missing ${field}: ${path.relative(docsDir, file)}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log(`Validated ${files.length} generated public docs.`);
