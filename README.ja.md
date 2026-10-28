# TurboWarp-Extended-Notification

<img src="assets/block-icon.svg" alt="" width="48" height="48">

[English](README.md) | 日本語

任意のタイムアウト付きで、独自の通知やキー入力を待つTurboWarp拡張機能です。

**ユーザーガイド:** [English](https://kubohiroya.github.io/turbowarp-extended-notification/) · [日本語](https://kubohiroya.github.io/turbowarp-extended-notification/ja/)

## 実行できるサンプル

[**TurboWarp Editorでデモを開く**](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-extended-notification%2Fsamples%2Fwait-for-notification.sb3) · [SB3をダウンロード](https://kubohiroya.github.io/turbowarp-extended-notification/samples/wait-for-notification.sb3)

**Run without sandbox**を選んで**Allow**し、緑の旗を押します。
並行スクリプトで待ち受けを開始してから`sendNotification`し、受信結果を表示。サンプルの元データと期待結果は[`samples/README.md`](samples/README.md)に記載しています。

`pnpm run samples:build`でSB3を再生成し、`pnpm run samples:check`で更新漏れと生成処理を確認します。

## 目的

TurboWarpのプロジェクトに、小さく再利用できる同期の仕組みを提供します。姿勢認識、音声認識、スプライトの
クリック検出といった入力固有の処理はcontrollerスプライト側に残し、そこから名前付きのextended notificationを
送出します。

## インストール

[`dist/extended-notification.js`](dist/extended-notification.js)をダウンロードし、TurboWarp Desktopで
ローカルのカスタム拡張機能として読み込みます。確認されたら**サンドボックス化せずに実行**を有効にします。

ビルド済みのJavaScriptファイルをこのリポジトリにcommitしてあるため、Node.jsのインストールやビルドの実行は
必要ありません。

npm packageからも導入できます。

```bash
npm install --save-exact @kubohiroya/turbowarp-extended-notification@0.5.0
```

拡張機能のbundleは次の場所にあります。

```text
node_modules/@kubohiroya/turbowarp-extended-notification/dist/extended-notification.js
```

## ブロック

| block | 種別 | opcode | 動作 |
|---|---|---|---|
| `send extended notification [MESSAGE]` | Command | `sendNotification` | その名前を待っているすべてのscriptへ通知を送ります。 |
| `wait until extended notification [MESSAGE] is received` | Command | `waitForNotification` | その名前の通知を受け取るまで、現在のscriptを停止します。 |
| `extended notification [MESSAGE] received before [SECONDS] seconds` | Boolean | `waitForNotificationOrTimeout` | タイムアウト前に通知が届けばtrue、そうでなければfalseを返します。 |
| `wait until [KEY] key is pressed` | Command | `waitForKey` | 選んだキーが押されるまで、現在のscriptを停止します。 |
| `[KEY] key pressed before [SECONDS] seconds` | Boolean | `waitForKeyOrTimeout` | タイムアウト前にキーが押されればtrue、そうでなければfalseを返します。 |

既定値は`MESSAGE`が`next`、`SECONDS`が`5`、`KEY`が`space`（`keyMenu`から選択）です。

タイムアウト付きのBoolean blockは、通知またはキー入力が先に起きればtrue、タイムアウトが先に起きればfalseを
返します。

## 開発

```bash
npm install --global corepack@latest
corepack enable
pnpm install --frozen-lockfile
pnpm run check
```

`src/block-definitions.json`を変更したら、blockのドキュメントを再生成します。

```bash
pnpm run docs
```

変更を監視して再ビルドする場合は次を使います。

```bash
pnpm run dev
```

Viteのビルドは次を生成します。

```text
dist/extended-notification.js
```

拡張機能のsourceを変更したら、再ビルドしたファイルをcommitしてください。

ドキュメントの変更が`main`へ入ると、GitHub Pagesのworkflowが`docs/`を公開します。新しいnpm versionと
対応するGitHub Releaseを公開する際は、[RELEASING.md](RELEASING.md)に従ってください。

このリポジトリはNode.js 24以降と、Corepack経由のpnpmを使います。package の`homepage`はPagesの
ユーザーガイドを指します。利用者の入口がそこであるためで、GitHubは`repository`と`bugs` metadataを通じて
sourceとissue trackerであり続けます。

## 設計

通知は保持しません。送出された通知は、その時点で同じ名前を待っているすべてのscriptを再開させます。
完全な挙動は[docs/specification.md](docs/specification.md)を参照してください。

## ライセンス

SPDX-License-Identifier: MPL-2.0

## 固定入力の編集

対応するTurboWarp GUIでは、固定入力フォームを有効にすると標準のリテラル欄だけを編集できます。数値は
完全な有限のJSON number token、menu欄は既存の選択肢を使います。reporterが接続された欄と利用できない欄は
読み取り専用のままで、評価されることはありません。変更せずに保存した場合、旧来の表記や未知の選択肢を含め、
既存の生の値がそのまま保持されます。不正な下書きは同じ編集セッション内に留まり、cancel、プロジェクトや
targetの差し替え、blockの削除で破棄されます。GUIのfeature flagを無効にすると、元の欄の編集に戻ります。
このフォームはblockを実行せず、ネットワーク・音声・キー入力・QRのセッションを開かず、名前の解決もSchema
引数の編集も行いません。

正式な契約は`schemas/block-editor-fixed-inputs.schema.json`、codecと任意の登録処理は
`src/fixed-input-editors.ts`にあります。これらの契約は新しい固定欄の候補を記述するもので、実行時データ全体を
再定義するものではありません。GUI統合は任意で、既存のstandalone/composition APIはそのまま使えます。

- `waitForNotificationOrTimeout`: SECONDS — [blockのドキュメント](https://kubohiroya.github.io/turbowarp-extended-notification/#block-waitForNotificationOrTimeout)
- `waitForKeyOrTimeout`: SECONDS — [blockのドキュメント](https://kubohiroya.github.io/turbowarp-extended-notification/#block-waitForKeyOrTimeout)
