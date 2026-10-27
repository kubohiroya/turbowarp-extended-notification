# TurboWarp-Extended-Notification

<img src="assets/block-icon.svg" alt="" width="48" height="48">

English | [日本語](README.ja.md)

A TurboWarp extension for waiting on custom notifications or key presses with optional timeouts.

**User guide:** [English](https://kubohiroya.github.io/turbowarp-extended-notification/) · [日本語](https://kubohiroya.github.io/turbowarp-extended-notification/ja/)

## Runnable sample

[**Open the demo in TurboWarp Editor**](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-extended-notification%2Fsamples%2Fwait-for-notification.sb3) · [Download the SB3](https://kubohiroya.github.io/turbowarp-extended-notification/samples/wait-for-notification.sb3)

Select **Run without sandbox**, then **Allow**, and click the green flag.
A second script sends sample-ready; the waiting block returns true.

Editable sources and expected results: [`samples/README.md`](samples/README.md).
Run `pnpm run samples:build` after source/bundle changes and `pnpm run samples:check` before committing.

## Purpose

The extension provides a small, reusable synchronization mechanism for TurboWarp projects. Input-specific logic such as pose recognition, speech recognition, or sprite click detection remains in controller sprites, which emit named extended notifications.

## Installation

Download [`dist/extended-notification.js`](dist/extended-notification.js), then open TurboWarp Desktop and load it as a local custom extension. Enable **Run extension without sandbox** when prompted.

The built JavaScript file is committed to this repository so that users do not need to install Node.js or run the build process.

Alternatively, install the npm package:

```bash
npm install --save-exact @kubohiroya/turbowarp-extended-notification@0.4.0
```

The extension bundle is then available at:

```text
node_modules/@kubohiroya/turbowarp-extended-notification/dist/extended-notification.js
```

## Block reference

<!-- BEGIN GENERATED BLOCKS -->

### `send extended notification [MESSAGE]`

Sends a named notification to every script currently waiting for that name.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `sendNotification` |
| `MESSAGE` | String, default: `next` |

### `wait until extended notification [MESSAGE] is received`

Pauses the current script until the named notification is received.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `waitForNotification` |
| `MESSAGE` | String, default: `next` |

### `extended notification [MESSAGE] received before [SECONDS] seconds`

Returns true when the named notification arrives before the timeout, otherwise false.

| Property | Value |
|---|---|
| Type | Boolean |
| Opcode | `waitForNotificationOrTimeout` |
| `MESSAGE` | String, default: `next` |
| `SECONDS` | Number, default: `5` |

### `wait until [KEY] key is pressed`

Pauses the current script until the selected key is pressed.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `waitForKey` |
| `KEY` | String, default: `space`, menu: `keyMenu` |

### `[KEY] key pressed before [SECONDS] seconds`

Returns true when the selected key is pressed before the timeout, otherwise false.

| Property | Value |
|---|---|
| Type | Boolean |
| Opcode | `waitForKeyOrTimeout` |
| `KEY` | String, default: `space`, menu: `keyMenu` |
| `SECONDS` | Number, default: `5` |

<!-- END GENERATED BLOCKS -->

The timeout-enabled Boolean blocks return `true` when the notification or key press occurs first and `false` when the timeout occurs first.

## Development

```bash
npm install --global corepack@latest
corepack enable
pnpm install --frozen-lockfile
pnpm run check
```

Regenerate block documentation after changing `src/block-definitions.json`:

```bash
pnpm run docs
```

For continuous rebuilding:

```bash
pnpm run dev
```

The Vite build creates:

```text
dist/extended-notification.js
```

Commit the rebuilt file whenever the extension source changes.

The GitHub Pages workflow publishes `docs/` after documentation changes reach
`main`. Maintainers should follow [RELEASING.md](RELEASING.md) when publishing a
new npm version and matching GitHub Release.

This repository uses Node.js 24 or later and pnpm through Corepack. The package `homepage` points
to the Pages user guide because that is the end-user entrypoint; GitHub remains the source and issue
tracker through `repository` and `bugs` metadata.

## Design

Notifications are not retained. An emitted notification resumes every script that is currently waiting for the same name. See [docs/specification.md](docs/specification.md) for the complete behavior.

## License

SPDX-License-Identifier: MPL-2.0

## Fixed input editing

With a compatible TurboWarp GUI, enable fixed-input forms to edit only standard literal fields. Numbers use complete finite JSON number tokens; menu fields use existing choices. Connected reporters and unavailable fields stay read-only and are never evaluated. Saving an unchanged form preserves exact existing raw values, including legacy spellings and unknown choices. Invalid drafts stay in the same editing session; cancel, project/target replacement, or block removal discards them. Disabling the GUI feature flag restores native field editing. This form does not run blocks, open network/audio/key/QR sessions, resolve names, or edit Schema arguments.

Canonical contracts: `schemas/block-editor-fixed-inputs.schema.json`; codecs and optional registration: `src/fixed-input-editors.ts`. These contracts describe new fixed-field candidates; they do not redefine all runtime data. The GUI integration is optional and existing standalone/composition APIs stay available.

- `waitForNotificationOrTimeout`: SECONDS — [block documentation](https://kubohiroya.github.io/turbowarp-extended-notification/#block-waitForNotificationOrTimeout).
- `waitForKeyOrTimeout`: SECONDS — [block documentation](https://kubohiroya.github.io/turbowarp-extended-notification/#block-waitForKeyOrTimeout).
