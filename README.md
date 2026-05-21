<div align="center">

  <img src="./src/assets/logo.png" alt="Logo" width="150"/>

  ## Dragit

  A convenient and modern UI to interact with Git repositories.

  [![Version](https://img.shields.io/badge/version-v1.0.1-blue)](https://semver.org/)
  [![License](https://img.shields.io/github/license/aledecicco/dragit)](https://opensource.org/licenses/gpl-3.0)
</div>

## Introduction
The goal of this project is to make a Git companion that is, above all, practical and pleasant to use.
Pretty much every action can be done through keyboard shortcuts, context menues, or simple drag and drop gestures.

Many aspects of Git's inner workings are simplified or abstracted away to make the user experience as smooth as possible, and all the necessary information is displayed in a single screen at every moment, speeding up the revision control process.

## Requirements

The current version leverages the user's installed Git version.

Git must be installed in the system and accessible at the `git` command.
A minimum version of `v2.51.0` is recommended.

## Roadmap

- [ ] Implement git operations in Rust
- [ ] Proper error handling and toasts
- [ ] Highlight file sections in scrollbar
- [ ] Animations
- [ ] Manage remote tags
- [ ] Resolve diff segments in diff viewer


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
