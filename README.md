<div align="center">

  <img src="./src/assets/logo.png" alt="Dragit logo" width="150"/>

  ## Dragit

  A convenient and modern GIT client. 

  Branch, merge, checkout, stage, all by dragging and dropping, hitting a shortcut, or using a context menu.

  [![Version](https://img.shields.io/github/v/tag/aledecicco/dragit)](https://github.com/aledecicco/dragit/releases)
  [![License](https://img.shields.io/github/license/aledecicco/dragit)](https://opensource.org/licenses/gpl-3.0)

  <!-- GIF: drag a branch from the list onto the graph merge zone this is the hero shot -->
  ![Demo](./docs/gifs/drag-merge.gif)
</div>


## Why

The goal of this project is to make a Git client that looks great and allows performing all the daily tasks of version control with a simplified flow. Git's complexity is abstracted away, but all of its power is still there. All necessary information is displayed on a single screen to avoid unnecessary back and forth, and all actions can be performed right away with a gesture, a hotkey, or a few clicks. 


## Features

Don't want to type? Everything can be done with a drag-and-drop gesture.

Like using the keyboard? Hotkeys and command palettes allow you to go through the workflow without having to reach for the mouse.

<br/>

<div align="center">
<img src="./assets/stage-file.gif" width="600"/>
<p>Stage or unstage a file</p>
</div>

<br/>

<div align="center">
<img src="./assets/stage-many.gif" width="600"/>
<p>Or all of them at once</p>
</div>

<br/>

<div align="center">
<img src="./assets/amend.gif" width="600"/>
<p>Made a mistake? Amend that last commit</p>
</div>

<br/>

<div align="center">
<img src="./assets/delete.gif" width="600"/>
<p>Have a bunch of old branches lying around? Drag them to the recycling bin</p>
</div>

<br/>

<div align="center">
<img src="./assets/context.gif" width="600"/>
<p>Open context menues for a more detailed list of all actions available</p>
</div>

<br/>

<div align="center">
<img src="./assets/shortcut.gif" width="600"/>
<p>Or trigger keyboard shortcuts to go faster</p>
</div>

<br/>

<div align="center">
<img src="./assets/diff.gif" align="center" width="800"/>
<p>Check your changes with the word-level diff viewer</p>
<p>Complete with syntax highlighting for all languages, including unmerged conflict views</p>
</div>

### And more

- **Branch and tag management**: create, delete, push, pull, fetch, fast-forward, and set upstreams
- **Stash management**: stash selected files, apply, or discard
- **Remote management**: add, remove, rename remotes and change URLs
- **In-progress operation toolbar**: contextual abort/continue actions surface automatically during merge, rebase, cherry-pick, and revert
- **Auto-updater**: built-in update mechanism via GitHub Releases


## Architecture
Dragit is built with Tauri v2: a React/TypeScript frontend runs in a WebView, while a Rust backend handles all Git logic, file watching, and OS integration. The Rust side includes:

`git_handler`: Git operations sit behind a GitHandler trait rather than being called directly. The current implementation (CmdGit) shells out to the system git binary, but the entire backend can be swapped for a native Rust implementation (currently on the roadmap).

`repo_watcher`: Watches the .git directory with a debouncer and emits typed events (BranchesChanged, StashesUpdated, TagsUpdated, etc.) over Tauri's event bus. This powers real-time sync, and the UI updates when Git state changes from any source (a terminal, an IDE, another tool) without polling.

`diffs`: Diff computation is done in a few stages. First, a file-level line diff is computed with `imara-diff`. Then, this diff is divided in hunks, and a word-level diff is computed for each hunk. Before being presented to the user, the diff is finally parsed and syntax-highlighted in the frontend.

`api`: Defines the commands that allow the backend and frontend to communicate. Datasets (commit history, diffs) are serialized with Borsh and sent over Tauri's Channel API, rather than the default JSON serialization used for regular commands. This is significantly faster for large payloads and avoids the overhead of JSON encoding/decoding on both sides.


## Tech Stack

| Layer | Technologies |
|---|---|
| **Desktop shell** | Tauri v2 |
| **Backend language** | Rust |
| **Git backend** | Shell subprocesses via Git CLI |
| **Diff engine** | `imara-diff` |
| **File watching** | `notify`  |
| **Frontend language** | TypeScript, React 19.2 |
| **Build tool** | Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Server state** | TanStack Query v5 |
| **Virtualization** | TanStack Virtual v3 |
| **Client state** | Zustand v5 + Immer |
| **Drag and drop** | dnd-kit |
| **Syntax highlighting** | `@wooorm/starry-night` |
| **Accessible UI primitives** | Ariakit |
| **Toasts** | Sonner |
| **Linter / formatter** | Biome |


## Requirements

Git must be installed and available on the `PATH` as the `git` command. Version `2.51.0` or later is recommended.


## Installation

Download the latest release for your platform from the [Releases page](https://github.com/aledecicco/dragit/releases). Installers are provided for macOS, Windows, and Linux.

The app includes a built-in auto-updater, so future updates install automatically once you're on a release build.

### Building from source

If you'd rather build it yourself, you can use the [`just`](https://github.com/casey/just) command `just build`. Building requires Node.js, Rust, and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS.

Linux builds also use [`docker`](https://docs.docker.com/get-docker) to run inside a container and avoid cross-platform issues.

After the build, you'll find the compiled binaries in the `src-tauri/target/release/bundle` directory.


## Roadmap

- [ ] Replace `CmdGit` with a native Rust Git backend (removes the system `git` dependency)
- [ ] Highlight changed file sections in the diff scrollbar
- [ ] Compare arbitrary refspecs side-by-side
- [ ] Show merge-base / union visualization between two branches
- [ ] Clone and open a repository from a URL
- [ ] Animations
- [ ] Allow layout adjustments
- [ ] Manage remote tags
- [ ] Resolve individual diff hunks directly in the diff viewer
