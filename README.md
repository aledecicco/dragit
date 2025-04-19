# Dragit

A convenient and modern UI to interact with Git repositories.

## Roadmap

Stash of ideas in ~planned implementation order:

- [x] Keyboard shortcuts cheatsheet component
- [ ] Loading indicators
- [ ] Remotes manipulation widgets
- [ ] Documentation pass
- [ ] Performance pass
- [ ] Checkout of remote branches, create branch from commit
- [ ] Paginate pathspec searches
- [ ] Highlight matches during pathspec search
- [ ] Drag and drop shortcuts
- [ ] Global keyboard shortcuts
- [ ] Settings screen
- [ ] Another pass
- [ ] Toasts (with lib)
- [ ] Decide on polling vs file watcher
- [ ] Implement git operations in Rust?

## Development

This project uses Tauri and PNPM. The PNPM version is locked by the Node tool `Corepack`.

Enabling Corepack:

```
corepack enable
```

Installing dependencies:

```
pnpm install
```

Running app in dev mode:

```
pnpm tauri dev
```

Adding dependencies:

```
pnpm add <pkgs>
```

For dev dependencies, use the `-D` flag.
