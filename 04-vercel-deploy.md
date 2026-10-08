# Vercel デプロイ手順

## 1. GitHub にリポジトリを作成して Push

```bash
cd yuka-ballet-liff
git init
git add .
git commit -m "feat: YUKA Ballet Art LINE mini app"
git remote add origin https://github.com/<your-org>/yuka-ballet-liff.git
git push -u origin main
```

## 2. Vercel にインポート

1. https://vercel.com/new を開き、GitHubアカウントでサインイン。
2. 「Import Git Repository」で `yuka-ballet-liff` を選択。
3. Framework Preset は **Next.js** を自動検出（変更不要）。

## 3. 環境変数を設定

Project Settings → Environment Variables に以下を登録（Production / Preview 両方）：

| 変数名 | 値 |
|---|---|
| `NEXT_PUBLIC_LIFF_ID` | LINE Developers Console で作成した LIFF ID（例: `2001234567-abcdEFGh`） |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Webアプリの API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `＜Project ID＞.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `＜Project ID＞.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Webアプリの App ID |

## 4. デプロイ → URL取得

「Deploy」を押下。完了後 `https://yuka-ballet-liff.vercel.app` 等のURLが発行される。

## 5. LINE Developers Console にエンドポイントURLを登録

1. LIFF設定の「エンドポイントURL」を `https://<vercel-domain>/` に変更。
2. 「LINEログイン」→ コールバックURLは LIFF が自動処理するため追加設定不要。

## 6. Firestore ルールとインデックスのデプロイ

```bash
npm i -g firebase-tools
firebase login
firebase init firestore   # プロジェクト選択, rules: firestore.rules, indexes: firestore.indexes.json
firebase deploy --only firestore:rules,firestore:indexes
```

## 7. 動作確認チェックリスト

- [ ] LINEアプリのミニアプリ（またはLINE内ブラウザ）で開ける
- [ ] 初回ログインで `users` コレクションにドキュメントが作成される
- [ ] 再ログインで `lastLoginAt` が更新される
- [ ] レッスン作成 → 生徒側で予約 → `reservedCount` が増える
- [ ] 定員に達すると「満席です」表示で予約不可
- [ ] 設定画面の「接続テスト」で `test_connection` に書き込まれ「Firestore接続成功」
