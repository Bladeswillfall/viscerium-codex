---
title:
description:
publish: false
status: draft
headerImage:
asset:
alt:
artist:
editor:
source:
sourceUrl:
credit:
license:
rights:
usage:
width:
height:
related:
---

# {{title}}

%% Image asset: set `asset` to the image filename stored in `Vault/Assets/Images/`, e.g. `portrait.webp`. Published image pages automatically render the asset and copy it to `/assets/images/...`. %%
%% Link articles back to this metadata note with `imagePage: /path/to/this/image-page/`. %%


```dataviewjs
await dv.view('Views/viscerium-sidebar', {
  accent: 'violet',
  sections: [
    { label: 'Asset', field: 'asset' },
    { label: 'Artist', field: 'artist' },
    { label: 'Editor', field: 'editor' },
    { label: 'Source', field: 'source' },
    { label: 'Source URL', field: 'sourceUrl' },
    { label: 'Credit', field: 'credit' },
    { label: 'License', field: 'license' },
    { label: 'Rights', field: 'rights' },
    { label: 'Usage', field: 'usage' },
    { label: 'Width', field: 'width' },
    { label: 'Height', field: 'height' },
    { label: 'Related', field: 'related' }
  ]
});
```


## Description

## Provenance

Record where this image came from, who made it, who edited it, and whether it is original, commissioned, reference-only, AI-generated, placeholder, or due to be replaced.

## Usage Notes

Describe where this image is used in the codex and whether it may be reused elsewhere.

## Related

---

## Comments

Keep public discussion notes or moderation reminders here. Published site comments render in their own bottom section via Giscus.
