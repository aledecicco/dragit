# Dragit

A convenient and modern UI to interact with Git repositories.

## Roadmap

Stash of ideas in ~planned implementation order:

- [x] Keyboard shortcuts cheatsheet component
- [x] Loading indicators
- [x] Remotes manipulation widgets
- [x] Commit details
- [x] Documentation pass
- [x] Performance pass
- [x] Global action tracking
- [x] Word diffs
- [x] Store bases and upstreams
- [x] Checkout of remote branches, create branch from commit
- [x] Tabs for filtering in branches widget
- [ ] "Create" option on empty comboboxes
- [ ] Highlight file sections in scrollbar
- [x] Merge continuation
- [ ] Open files on click
- [ ] Display old paths in file viewers for moved files
- [x] Paginate pathspec searches
- [ ] "Init", "empty dir", and "not a repository" screens
- [ ] Highlight matches during pathspec search
- [ ] More complete commit dialog with "amend" option
- [ ] Animations pass
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
