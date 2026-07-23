from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# The first migration intentionally rewrites YAML status tokens. In executable
# source, object literals need the value quoted instead of treated as an identifier.
for suffix in ("*.js", "*.mjs", "*.ts", "*.tsx", "*.astro"):
    for file in ROOT.rglob(suffix):
        if any(part in {"node_modules", ".git", "dist"} for part in file.parts):
            continue
        content = file.read_text(encoding="utf-8")
        updated = re.sub(r"(?<![\"'])\bstatus:\s*published\b(?![\"'])", "status: 'published'", content)
        if updated != content:
            file.write_text(updated, encoding="utf-8")

# Bring the checked-in Minimal settings back in sync with the documented/tested
# creator baseline. This drift pre-dated the migration but blocks a clean suite.
minimal_path = ROOT / "Vault/.obsidian/plugins/obsidian-minimal-settings/data.json"
minimal = json.loads(minimal_path.read_text(encoding="utf-8"))
minimal["readableLineLength"] = True
minimal["lineWidth"] = 64
minimal["lineWidthWide"] = 76
minimal["maxWidth"] = 92
minimal_path.write_text(json.dumps(minimal, indent=2) + "\n", encoding="utf-8")

print("Publication literal and Minimal settings fixes applied.")
