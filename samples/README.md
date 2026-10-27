# Extended Notificationの最小デモ

- 配布: [`wait-for-notification.sb3`](https://kubohiroya.github.io/turbowarp-extended-notification/samples/wait-for-notification.sb3)
- 起動: [TurboWarp Editor](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-extended-notification%2Fsamples%2Fwait-for-notification.sb3)
- 操作: **Run without sandbox**を選んで**Allow**し、緑の旗を押します。
- 内容: 並行スクリプトで待ち受けを開始してから`sendNotification`し、受信結果を表示
- 期待結果: A second script sends sample-ready; the waiting block returns true.

`manifest.json`に拡張ID・JSパス・sandbox条件・期待結果を記録しています。
`wait-for-notification/project.json`と自作SVGを編集し、次のコマンドで再生成します。

```bash
pnpm run samples:build
pnpm run samples:check
pnpm run pages:build
```

Node.jsは`.nvmrc`指定版を使います。サンプル生成に追加依存はありません。
生成したSB3もコミットし、`_site/`のdocs・dist・SB3をPagesへ公開します。
unsandboxed拡張は検証対象JSをSB3へ同梱し、利用者が通常の同意画面で許可します。
sandbox互換の拡張はPages上のJSを参照します。

緑の旗で毎回入力から結果を生成します。停止してから再実行できます。

切戻しはサンプル・READMEリンク・Pages配信設定の追加をrevertします。
