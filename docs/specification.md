# Extended Notification Specification

[日本語](./ja/specification.md)

## Scope

Extended Notification provides a small synchronization layer for TurboWarp projects. It allows one script to emit a named notification and other scripts to wait for that notification. It also provides equivalent waiting blocks for keyboard input.

The extension does not implement pose recognition, speech recognition, sprite click detection, or other domain-specific input systems. Those systems should emit an extended notification from a controller sprite.

## Notification semantics

- Notifications are not queued or retained.
- A notification resumes every script currently waiting for the same name.
- A notification emitted before a script begins waiting does not satisfy that later wait.
- Notification names are converted with `Scratch.Cast.toString`.

## Timeout semantics

The Boolean timeout blocks return:

- `true` when the notification or key press occurs first;
- `false` when the timeout expires first;
- `false` when the project stop operation cancels the wait.

Non-finite, zero, and negative timeout values are treated as zero seconds.

## Keyboard semantics

- A key wait observes `keydown` events that occur after the block begins waiting.
- Repeated `keydown` events generated while a key remains held are ignored.
- Common Japanese and English names for Space, arrow, Enter, and Escape keys are normalized.
- Letter and digit keys can be matched through both `KeyboardEvent.key` and `KeyboardEvent.code`.

## Blocks

- `[MESSAGE] を拡張通知する`
- `[MESSAGE] 拡張通知を受け取るまで待つ`
- `<[MESSAGE] 拡張通知を受け取る または [SECONDS] 秒待った>`
- `[KEY] キー押下の拡張通知まで待つ`
- `<[KEY] キー押下の拡張通知 または [SECONDS] 秒を待った>`

## Execution requirements

The extension must run unsandboxed because it listens for browser keyboard events and observes the TurboWarp runtime stop event.
