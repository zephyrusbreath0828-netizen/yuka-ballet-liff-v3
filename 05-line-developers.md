# LINE Developers 設定手順

## 1. プロバイダー作成

1. https://developers.line.biz/console/ にログイン（LINEアカウント必要）。
2. 「新規プロバイダー作成」→ プロバイダー名: `YUKA Ballet Art`。

## 2. LINEログインチャネル作成

1. プロバイダー配下で「LINEログイン」チャネルを作成。
2. チャネル基本設定で「アプリタイプ」: **ウェブアプリ** にチェック。
3. 「法人・個人情報利用」は個人教室であれば未入力で可。

## 3. LIFF アプリ追加

1. チャネルタブ →「LIFF」→「追加」。
2. 入力項目：

| 項目 | 設定値 |
|---|---|
| LIFFアプリ名 | YUKA Ballet Art |
| エンドポイントURL | `https://<vercel-domain>/`（先にVercelへデプロイしてURLを取得） |
| アプリサイズ | フル（Full） |
| モジュール | オフ（任意） |
| スコープ | `profile` / `openid` |
| ボットリンク | オン（フォローしない）/ 既存Bot連携する場合はオン |
| チャネルリンク | オフ（任意） |
| 友だち追加オプション | フォローしない |

3. 保存後、**LIFF ID**（例: `2001234567-abcdEFGh`）を控える。
4. `.env.local`（ローカル）と Vercel の環境変数 `NEXT_PUBLIC_LIFF_ID` に設定。

## 4. 公式LINEアカウント（任意・トーク機能用）

1. https://account.line.biz/ で「YUKA Ballet Art」公式アカウントを作成。
2. 「トーク」タブの応答設定でチャットを有効化。
3. アプリ内のトーク機能は `liff.openWindow` で公式アカウントのトークを開く実装。
   ※ `@yuka-ballet` 部分を自アカウントの基本IDに変更してください（src/lib/liff.ts の `openLineTalk`）。

## 5. レッスン終了通知（発展）

通知送信は Firebase Cloud Functions + LINE Messaging API の構成を推奨：

1. LINE公式アカウント → チャネルごとに発行される **チャネルアクセストークン** を取得。
2. Cloud Functions で `notificationType` に応じて Pub/Sub スケジューラを生成：
   - `at_end` → `endAt` 时刻
   - `before_15m` → `endAt - 15分`（以下同様）
3. トリガー時に対象 `lessonReservations` の `userId` 宛てに Push メッセージ送信。

## 6. 動作確認

1. LINEアプリで「LINEミニアプリ」検索、または直接LIFF URLをQRで開く。
2. 初回起動で権限同意 → プロフィール取得 → users 登録を確認。
