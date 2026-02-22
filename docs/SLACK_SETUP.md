# Slack統合セットアップガイド

shadow-meをSlackアプリとして設定する詳細な手順です。

## 1. Slackアプリの作成

1. [api.slack.com/apps](https://api.slack.com/apps)にアクセス
2. 「Create New App」をクリック
3. 「From scratch」を選択
4. アプリ名（例：shadow-me）とワークスペースを選択

## 2. OAuth & Permissions設定

1. 左メニューから「OAuth & Permissions」を選択
2. 「Scopes」セクションまでスクロール
3. 以下のBot Token Scopesを追加：
   - `app_mentions:read` - アプリへのメンションを読む
   - `channels:history` - チャンネルメッセージを読む
   - `chat:write` - メッセージを送信
   - `im:history` - ダイレクトメッセージを読む

## 3. アプリのインストール

1. ページ上部の「Install to Workspace」をクリック
2. 権限を確認して「Allow」をクリック
3. 「Bot User OAuth Token」をコピー（`xoxb-`で始まる）

## 4. 環境変数の設定

1. `.env`ファイルを作成（`.env.example`をコピー）
2. 以下を設定：

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

Signing Secretは「Basic Information」→「App Credentials」→「Signing Secret」から取得できます。

## 5. ローカル開発環境の準備

ローカルで開発する場合、ngrokを使ってローカルサーバーを公開します：

```bash
# 別のターミナルでngrokを起動
ngrok http 4111

# Mastraサーバーを起動
npm run dev
```

ngrokが提供するHTTPS URLをメモします（例：`https://abc123.ngrok.io`）

## 6. Event Subscriptionsの設定

1. Slackアプリ設定で「Event Subscriptions」を選択
2. 「Enable Events」をオンにする
3. 「Request URL」に以下を入力：
   ```
   https://your-ngrok-url.ngrok.io/api/slack/events
   ```
   （本番環境では実際のサーバーURLを使用）

4. 「Verified」と表示されるまで待つ
5. 「Subscribe to bot events」で以下を追加：
   - `app_mention` - アプリがメンションされたとき
   - `message.im` - ダイレクトメッセージを受信したとき

6. 「Save Changes」をクリック

## 7. アプリの再インストール

Event Subscriptionsを変更した場合、アプリの再インストールが必要です：

1. 「Install App」ページに移動
2. 「Reinstall App」をクリック

## 8. 動作確認

1. Slackワークスペースでチャンネルに移動
2. `@shadow-me こんにちは`とメンションを送信
3. shadow-meが応答することを確認

## トラブルシューティング

### イベントが受信されない

- ngrokが起動しているか確認
- Request URLが正しく設定されているか確認
- Mastraサーバー（`npm run dev`）が起動しているか確認
- Event Subscriptionsが正しく設定されているか確認

### 署名検証エラー

- `.env`のSLACK_SIGNING_SECRETが正しいか確認
- リクエストのタイムスタンプが古すぎないか確認（5分以内）

### 応答がない

- ログを確認（Mastraサーバーのコンソール出力）
- OpenAI APIキーが正しく設定されているか確認
- shadow-meエージェントが正しく登録されているか確認
