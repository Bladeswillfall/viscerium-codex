---
title:
description:
publish: false
status: draft
slug: images/
type: image
headerImage:
asset:
alt:
credit:
license:
related:
---

# {{title}}

%% Header image: set `headerImage` to a vault asset path that can publish to `/assets/images/...`; in Obsidian, preview it here when useful. %%
%% Page breadcrumbs: Home / {{type}} / {{title}}. Keep these as wiki links when parent pages exist. %%


```dataviewjs
await dv.view('Views/viscerium-sidebar', {
  accent: 'violet',
  sections: [
    { label: 'Asset', field: 'asset' },
    { label: 'Credit', field: 'credit' },
    { label: 'License', field: 'license' },
    { label: 'Related', field: 'related' }
  ]
});
```


## Description

## Usage Notes

## Related

## Comments

Keep public discussion notes or moderation reminders here. Published site comments render in their own bottom section via Giscus.
