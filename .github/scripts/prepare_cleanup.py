from pathlib import Path

path = Path(__file__).with_name('apply_cleanup.py')
content = path.read_text(encoding='utf-8')
old = r'''replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "  const rel = path.relative(sourceDir, file).replace(/\\\\/g, '/').replace(/\\.(md|mdx)$/i, '');",
    "  const rel = toPosixPath(path.relative(sourceDir, file)).replace(/\\.(md|mdx)$/i, '');",
)
'''
new = r'''replace_once(
    "Site/scripts/sync-public-notes.mjs",
    dedent(r\'\'\'
    function slugFromFile(file) {
      const rel = path.relative(sourceDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
      return rel.split('/').map((segment) => cleanSlug(segment).replace(/\s+/g, '-')).join('/');
    }
    \'\'\'),
    dedent(r\'\'\'
    function slugFromFile(file) {
      const rel = toPosixPath(path.relative(sourceDir, file)).replace(/\.(md|mdx)$/i, '');
      return rel.split('/').map((segment) => cleanSlug(segment).replace(/\s+/g, '-')).join('/');
    }
    \'\'\'),
)
'''.replace("r\\'\\'\\'", "r'''").replace("\\'\\'\\'", "'''")
count = content.count(old)
if count != 1:
    raise RuntimeError(f'Expected one ambiguous sync-public-notes replacement block, found {count}')
path.write_text(content.replace(old, new, 1), encoding='utf-8')
print('Prepared cleanup migration script.')
