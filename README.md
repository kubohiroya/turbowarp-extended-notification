# TurboWarp Extended Notification

A TurboWarp extension for waiting on custom notifications or key presses with optional timeouts.

**User guide:** [English](https://kubohiroya.github.io/turbowarp-extended-notification/) · [日本語](https://kubohiroya.github.io/turbowarp-extended-notification/ja/)

## Purpose

The extension provides a small, reusable synchronization mechanism for TurboWarp projects. Input-specific logic such as pose recognition, speech recognition, or sprite click detection remains in controller sprites, which emit named extended notifications.

## Installation

Download [`dist/extended-notification.js`](dist/extended-notification.js), then open TurboWarp Desktop and load it as a local custom extension. Enable **Run extension without sandbox** when prompted.

The built JavaScript file is committed to this repository so that users do not need to install Node.js or run the build process.

Alternatively, install the npm package:

```bash
npm install --save-exact @kubohiroya/turbowarp-extended-notification@0.1.1
```

The extension bundle is then available at:

```text
node_modules/@kubohiroya/turbowarp-extended-notification/dist/extended-notification.js
```

## Blocks

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
npm install
npm run check
```

Regenerate block documentation after changing `src/block-definitions.json`:

```bash
npm run docs
```

For continuous rebuilding:

```bash
npm run dev
```

The Vite build creates:

```text
dist/extended-notification.js
```

Commit the rebuilt file whenever the extension source changes.

The GitHub Pages workflow publishes `docs/` after documentation changes reach
`main`. Maintainers should follow [RELEASING.md](RELEASING.md) when publishing a
new npm version and matching GitHub Release.

## Design

Notifications are not retained. An emitted notification resumes every script that is currently waiting for the same name. See [docs/specification.md](docs/specification.md) for the complete behavior.

## License

MPL-2.0
