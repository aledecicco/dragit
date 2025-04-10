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

- The `assets` directory houses all images, SVGs, and icons used by the app.

- The `components` directory houses components related to all features that the app is expected to have. This includes the customizations of components in the UI library, widgets used in the app's layout, and all the underlying building blocks.

- The `context` directory houses definitions, setters, and getters for global app state.

- The `utils` directory houses any general utilities, polyfills, and hooks.
