# TurboWarp Extended Notification

A TurboWarp extension for waiting on custom notifications or key presses with optional timeouts.

## Purpose

The extension provides a small, reusable synchronization mechanism for TurboWarp projects. Input-specific logic such as pose recognition, speech recognition, or sprite click detection remains in controller sprites, which emit named extended notifications.

## Blocks

- `[MESSAGE] を拡張通知する`
- `[MESSAGE] 拡張通知を受け取るまで待つ`
- `<[MESSAGE] 拡張通知を受け取る または [SECONDS] 秒待った>`
- `[KEY] キー押下の拡張通知まで待つ`
- `<[KEY] キー押下の拡張通知 または [SECONDS] 秒を待った>`

The timeout-enabled Boolean blocks return `true` when the notification or key press occurs first and `false` when the timeout occurs first.

## Development

```bash
npm install
npm run check
```

For continuous rebuilding:

```bash
npm run dev
```

The Vite build creates:

```text
dist/extended-notification.js
```

Load this file as a TurboWarp custom extension and enable **Run extension without sandbox**.

## Design

Notifications are not retained. An emitted notification resumes every script that is currently waiting for the same name. See [docs/specification.md](docs/specification.md) for the complete behavior.

## License

MPL-2.0
