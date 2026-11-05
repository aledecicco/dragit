<div align="center">

  <img src="./src/assets/logo.png" alt="Dragit logo" width="150"/>

  ## Dragit

  A modern and convenient Git client. 

  Branch, merge, checkout, stage, all by dragging and dropping or hitting a hotkey.

  [![Version](https://img.shields.io/github/v/tag/aledecicco/dragit)](https://github.com/aledecicco/dragit/releases)
  [![License](https://img.shields.io/github/license/aledecicco/dragit)](https://opensource.org/licenses/gpl-3.0)
  [![Buy me a coffee](https://img.shields.io/badge/%E2%80%8B-Buy%20me%20a%20coffee-FFDD00?logo=buymeacoffee&logoColor=FFDD00)](https://www.buymeacoffee.com/adecicco)

  <img src="./assets/merge.webp" width="800"/>
</div>

<br/>


## Motivation

The goal of this project is to make a Git client that looks great and allows performing all the daily tasks of version control with a simplified flow. Git's complexity is abstracted away, but all of its power is still there. So you get a streamlined experience where any action can be performed right away with a gesture, a hotkey, or a few clicks, with all the necessary information displayed at all times on a single screen.


## Features

Don't want to type? Everything can be done with a drag-and-drop gesture.

Like using the keyboard? Hotkeys and command palettes allow you to go through the workflow without having to reach for the mouse.

Here are a few:

<br/>

<div align="center">
    <img src="./assets/stage-many.webp" width="380"/>
    <p>Stage files by dragging them, one at a time, a few, or all of them at once</p>
</div>

<br/>

<div align="center">
    <img src="./assets/commit.webp" width="800"/>
    <p>Drop your staged changes on the draft commit to commit them</p>
</div>

<br/>

<div align="center">
    <img src="./assets/ai.webp" width="800"/>
    <p>Or let an AI agent write the commit message for you</p>
</div>

<br/>

<div align="center">
    <img src="./assets/amend.webp" width="800"/>
    <p>Amend that last commit if you made a mistake</p>
</div>

<br/>

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="./assets/stash.webp" width="380"/></td>
    <td align="center" width="50%"><img src="./assets/delete.webp" width="380"/></td>
  </tr>
  <tr>
    <td align="center">Stash your changes, and drop the stash back to apply it</td>
    <td align="center">Drag old branches that are lying around to the recycling bin</td>
  </tr>
</table>

<br/>

<div align="center">
    <img src="./assets/checkout.webp" width="800"/>
    <p>Check out a branch, or compare against a different base, by dropping refs on the graph</p>
</div>

<br/>

<div align="center">
    <img src="./assets/tag.webp" width="800"/>
    <p>Tag a commit by dropping it on the tags list</p>
</div>

<br/>

<table align="center">
  <tr>
    <td align="center" width="50%"><img src="./assets/cherry-pick.webp" width="380"/></td>
    <td align="center" width="50%"><img src="./assets/revert.webp" width="380"/></td>
  </tr>
  <tr>
    <td align="center">Cherry-pick commits from other branches</td>
    <td align="center">Or revert them, from the same menu</td>
  </tr>
</table>

<br/>

<div align="center">
    <img src="./assets/context.webp" width="380"/>
    <p>Open context menus for a more detailed list of all actions available</p>
</div>

<br/>

<div align="center">
    <img src="./assets/shortcut.webp" width="800"/>
    <p>Or use keyboard shortcuts to go faster: hold the modifiers to reveal them</p>
</div>

<br/>

<div align="center">
    <img src="./assets/settings.webp" width="800"/>
    <p>Every shortcut can be changed to your liking</p>
</div>

<br/>

<div align="center">
    <img src="./assets/palette.webp" width="800"/>
    <p>The command palette runs whole flows, like staging and committing everything at once</p>
</div>

<br/>

<div align="center">
    <img src="./assets/diff.webp" width="800"/>
    <p>Check your changes with the integrated word-level diff viewer, complete with syntax highlighting for all languages, and views of the file before and after the changes</p>
</div>

<br/>

<div align="center">
    <img src="./assets/conflict.webp" width="800"/>
    <p>Merge conflicts get the same treatment</p>
</div>

<br/>

<div align="center">
    <img src="./assets/compare.webp" width="800"/>
    <p>Compare any two branches, tags or commits side by side</p>
</div>

<br/>

<div align="center">
    <img src="./assets/details.webp" width="800"/>
    <p>See what any commit changed</p>
</div>

<br/>

<div align="center">
    <img src="./assets/compact.webp" width="800"/>
    <p>On smaller screens, columns collapse into rails that open up while you drag things over them</p>
</div>

<br/>


## Installation

Download the latest release for your platform from the [Releases page](https://github.com/aledecicco/dragit/releases). Installers are provided for macOS, Windows, and Linux.

The app includes a built-in auto-updater, so future updates install automatically once you're on a release build.

Git must be installed and available on the `PATH` as the `git` command. Version `2.51.0` or later is recommended.

### Building from source

If you'd rather build it yourself, you can use the [`just`](https://github.com/casey/just) command `just build`. Building requires Node.js, Rust, and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS.

Linux builds also use [`Docker`](https://docs.docker.com/get-docker) to run inside a container and avoid cross-platform issues.

After the build, you'll find the compiled binaries in the `src-tauri/target/release/bundle` directory.

There's also a convenience command for Arch users that uses the binaries produced by the build and installs the app: `just build-aur`.


## Tech Stack

Dragit is built with Tauri v2. A React/TypeScript frontend runs in a WebView, while a Rust backend handles all Git logic, file watching, and OS integration.

| Layer                   | Technologies            |
|-------------------------|-------------------------|
| **Desktop shell**       | Tauri v2                |
| **Frontend**            | TypeScript, React 19.2  |
| **Backend**             | Rust                    |
| **Git backend**         | Git CLI                 |
| **Diff engine**         | imara-diff              |
| **Serialization**       | Borsh                   |
| **File watcher**        | notify                  |
| **Build tool**          | Vite                    |
| **Styling**             | Tailwind CSS v4         |
| **Virtualization**      | TanStack Virtual        |
| **Client state**        | Zustand, TanStack Query |
| **Drag and drop**       | dnd-kit                 |
| **Syntax highlighting** | starry-night            |
| **UI primitives**       | Ariakit                 |
| **Toasts**              | Sonner                  |
| **Linter / formatter**  | Biome                   |


## Roadmap

There's always things to improve:

- [ ] Replace `CmdGit` with a native Rust Git backend (removes the system `git` dependency)
- [x] Highlight changed file sections in the diff scrollbar
- [x] Compare arbitrary refspecs side-by-side
- [ ] Show merge unions between branches
- [x] Clone and open a repository from a URL
- [ ] Animations
- [ ] Allow layout adjustments
- [ ] Manage remote tags
- [ ] Resolve individual diff hunks directly in the diff viewer
