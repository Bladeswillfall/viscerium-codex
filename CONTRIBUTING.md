# Contributing

Thanks for helping improve this codex.

1. Edit source lore in `Vault/Lore/`, not generated files in `Site/src/content/docs/`.
2. Public notes need `publish: true`, `status: canon`, `title`, `description`, `slug`, and `type`.
3. Run validation before opening a pull request:

```bash
cd Site
npm install
npm run build
```

Pull requests should include a short summary, validation steps, and screenshots for visible design changes.
