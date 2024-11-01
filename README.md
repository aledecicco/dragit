# Gitree

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

- The `api` directory houses the client definition that gives default options to all queries, and any general level queries can be defined in the `api/queries` directory. This is where the bindings for the backend commands are exported as well.

- The `assets` directory houses all images, SVGs, and icons used by other components.

- The `components` directory houses components related to all features that the app is expected to have. This includes "Lib" components used many times throughout the app, structural components, and any "Misc" components used for dev testing or other things.

- The `utils` directory houses any general utilities, pollyfills, and hooks.

- The `models` directory houses any custom types used to model the underlying logic.
