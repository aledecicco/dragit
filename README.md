# Dragit

This project uses Tauri and PNPM. The PNPM version is locked by the Node tool `Corepack`.

## Usage

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

## Frontend Project Structure

- The `api` directory houses the implementation of the API that communicates with the backend. Bindings for commands and queries, and their needed types, are all defined here.

- The `assets` directory houses all images, SVGs, and icons used by other components.

- The `components` directory houses components related to all features that the app is expected to have. This includes "Lib" components used many times throughout the app, structural components, and any "Misc" components used for dev testing or other things.

- The `utils` directory houses any general utilities, polyfills, and hooks.
