# Contributor attribution

The Codex displays a compact, expandable contributor stack above comments on normal public lore pages.

## Registry

Contributor identities are defined once in `src/data/contributors.json`:

```json
{
  "profiles": {
    "fall": {
      "name": "Fall",
      "github": "Bladeswillfall",
      "avatar": "fall.webp"
    }
  }
}
```

Avatar filenames must use `.webp`. Persistent cached files live in:

```text
Vault/Assets/Contributors/
```

During `npm run sync`, each registered GitHub avatar is refreshed, converted to a 192 × 192 WebP, retained in the vault cache, and copied to:

```text
Site/public/assets/contributors/
```

When GitHub cannot be reached, the last cached WebP is retained. If no cache exists, sync creates a local WebP placeholder rather than failing the site build.

Set `CODEX_SKIP_AVATAR_REFRESH=1` to copy existing cached avatars without requesting GitHub.

## Defaults

`defaultContributors` in the registry are automatically added to normal public lore pages. Fall is currently the default Author.

Generated categories, utility pages, system pages, changelogs, the homepage, and other non-lore routes do not receive defaults.

Disable defaults for an individual lore page with:

```yaml
defaultContributors: false
```

## Page frontmatter

Add contributors with their registry ID and role:

```yaml
contributors:
  - id: another-writer
    role: Author
  - id: lore-editor
    role: Editor
```

A contributor may have multiple roles:

```yaml
contributors:
  - id: another-writer
    roles:
      - Co-author
      - Research
```

String shorthand is also accepted and receives the generic `Contributor` role:

```yaml
contributors:
  - another-writer
```

Duplicate IDs are merged and their roles combined. Authors are sorted first and receive the highlighted avatar ring.

## Reusable tooltips

`src/components/Tooltip.astro` is a reusable accessible tooltip primitive. In MDX it can be used for short definitions without creating a full article:

```mdx
import Tooltip from '../../../components/Tooltip.astro';

A <Tooltip text="A Resonant whose ability has been formally recognised and regulated.">licensed Resonant</Tooltip> entered the hall.
```

The trigger works with pointer hover and keyboard focus. Pass `href` to make the trigger a link, as used by contributor profile icons.
