# YUKA Ballet Art — LINE ミニアプリ

バレエ教室の会員・予約・出欠・集金管理を LINE 上で行うミニアプリです。
Next.js 15（App Router）+ TypeScript + Tailwind CSS + Firebase v11 + LIFF SDK 構成。Vercel デプロイ対応。

## 技術スタック

| 区分 | 採用技術 |
|---|---|
| フロントエンド | Next.js 15（App Router）/ TypeScript / Tailwind CSS |
| 認証 | LINE Login（LIFF）/ Firebase Authentication |
| データベース | Cloud Firestore |
| ホスティング | Vercel |

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を設定
npm run dev                        # http://localhost:3000
```

## 環境変数

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_LIFF_ID` | LINE Developers で発行される LIFF ID |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web アプリの apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | appId |

※ Firebase の設定値は環境変数からのみ読み込みます（ソースへの直書きなし）。

---

## 1. Firebase 設定手順

1. https://console.firebase.google.com/ に Google アカウントでサインインし、「プロジェクトを追加」。
2. 「構築」→「Authentication」→「始める」を開き、Sign-in method を有効化。
3. 「構築」→「Firestore Database」→「データベースの作成」。
   - ロケーション: 東京（`asia-northeast1`）推奨
   - 「本番環境モードで開始」を選択
4. プロジェクトの設定（歯車）→「アプリを追加」→ ウェブ（`</>`）→ アプリを登録。
5. 表示される `firebaseConfig` の各値を上記の環境変数へ割り当てる。
6. 「ルール」タブで `firestore.rules` の内容を貼り付けて公開。
7. 複合インデックスが必要な場合は `firestore.indexes.json` を参考に作成
   （アプリ画面に「インデックスを作成」リンクが表示された場合はそれをクリック）。

### Firestore コレクション

`users` / `students` / `teachers` / `lessons` / `attendance` / `announcements`
（詳細は `docs/01-firestore-design.md` を参照）

---

## 2. Vercel デプロイ手順

1. GitHub へリポジトリを作成し、本フォルダ一式をアップロード（`Add file` → `Upload files`）。
2. https://vercel.com/new を開き、GitHub でサインインして対象リポジトリを Import。
3. Framework Preset が **Next.js** として自動検出されることを確認（追加設定は不要）。
4. 「Environment Variables」に上記 7 項目を Production / Preview 両方へ登録。
5. 「Deploy」を押下 → `https://<project>.vercel.app` のURLが発行される。
6. 発行URLを LINE Developers の LIFF エンドポイントURLに登録（下記手順）。
7. `NEXT_PUBLIC_LIFF_ID` を Vercel に追加した場合は「Deployments」→「Redeploy」で再公開。

`vercel.json` は次の内容で固定です。

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["hnd1"]
}
```

---

## 3. LINE Developers 設定手順

1. https://developers.line.biz/console/ に LINE アカウントでサインイン。
2. 「Create a new provider」→ プロバイダー名（例: `YUKA Ballet Art`）を作成。
3. 「Create a new channel」→「LINE Login」を選択し、アプリタイプで「ウェブアプリ」にチェックして作成。
4. チャネルの「LIFF」タブ →「Add」でLIFFアプリを追加。

| 項目 | 設定値 |
|---|---|
| LIFF app name | YUKA Ballet Art |
| Size | Full |
| Endpoint URL | Vercel の発行URL（末尾に `/`） |
| Scopes | `profile`, `openid` |

5. 発行された **LIFF ID** を `NEXT_PUBLIC_LIFF_ID` に設定し、Vercel を Redeploy。
6. LINE アプリで URL を開き、プロフィール取得と `users` 登録を確認。

### 管理者権限の付与

初回ログイン時は `role: "student"` で登録されます。
Firebase Console → Firestore → `users` → 対象ドキュメントの `role` を `admin` へ変更してください。

---

## スクリプト

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run start   # 本番サーバー
npm run lint    # ESLint
```
