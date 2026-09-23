# YUKA Ballet Art — LINE ミニアプリ

バレエ教室「YUKA Ballet Art」向けの LINE ミニアプリです。
生徒管理・出欠管理・レッスンスケジュール・お知らせをスマホから確認／登録できます。

- **フレームワーク**: Next.js 15（App Router）/ React 19 / TypeScript
- **スタイル**: Tailwind CSS v4（`@config` で `tailwind.config.ts` を読み込み）
- **認証**: LINE Login（LIFF SDK）+ Firebase Authentication
- **データベース**: Cloud Firestore
- **デプロイ**: Vercel（`hnd1` リージョン）
- **UI**: スマホファースト / LINE ミニアプリ向け / レスポンシブ

---

## 1. ディレクトリ構成

```
yuka-ballet/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # ルートレイアウト（AuthProvider + AppShell）
│  │  ├─ page.tsx                # ホーム
│  │  ├─ globals.css
│  │  ├─ api/auth/line/route.ts  # LINE IDトークン検証 → Firebase カスタムトークン発行
│  │  ├─ students/               # 生徒一覧・生徒詳細
│  │  ├─ lessons/                # レッスンスケジュール・詳細
│  │  ├─ attendance/             # 出欠管理
│  │  ├─ announcements/          # お知らせ一覧・詳細
│  │  ├─ admin/                  # 管理者画面
│  │  ├─ teacher/                # 講師画面
│  │  ├─ parent/                 # 保護者画面
│  │  └─ settings/               # 設定・ログイン状態
│  ├─ components/                # AppShell / BottomNav / RoleGuard / UI 部品
│  └─ lib/
│     ├─ env.ts                  # 環境変数の読み込み（NEXT_PUBLIC_*）
│     ├─ firebase.ts             # Firebase クライアント初期化（多重初期化ガード）
│     ├─ liff.ts                 # LIFF SDK 初期化（動的 import）
│     ├─ auth-context.tsx        # 認証コンテキスト（LIFF → Firebase）
│     ├─ types.ts                # 型定義・コレクション名・ラベル
│     ├─ repository.ts           # Firestore データアクセス層
│     ├─ functions.ts            # 集計ロジック（出席率など）
│     ├─ mock.ts                 # デモデータ
│     └─ format.ts               # 日付・表示フォーマット
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
├─ vercel.json
├─ .env.example
└─ package.json
```

## 2. 機能一覧

| 画面 | パス | 主な機能 |
| --- | --- | --- |
| ホーム | `/` | 件数サマリー・次のレッスン・ピン留めのお知らせ |
| 生徒一覧 | `/students` | 名前／ふりがな検索、レベル絞り込み |
| 生徒詳細 | `/students/[id]` | 出席率・出欠履歴・受講クラス |
| レッスン | `/lessons` | 日付ごとのスケジュール、過去／今後切替 |
| レッスン詳細 | `/lessons/[id]` | 受講者と出欠状況 |
| 出欠管理 | `/attendance` | レッスン選択 → 出席／遅刻／欠席／公欠を一括保存 |
| お知らせ | `/announcements` | 配信対象・重要フラグ付き一覧 |
| 管理者 | `/admin` | 生徒登録／削除、お知らせ投稿／削除、権限変更、初期データ投入 |
| 講師 | `/teacher` | 担当レッスン・在籍生徒・出欠入力への導線 |
| 保護者 | `/parent` | お子さまの出席率・出欠・予定・お知らせ |
| 設定 | `/settings` | ログイン状態、ロール切替（デモ）、未設定の環境変数表示 |

ロールは `admin` / `teacher` / `parent` の3種類で、`RoleGuard` により画面アクセスを制御します。

## 3. Firestore コレクション構成

| コレクション | ドキュメントの主なフィールド |
| --- | --- |
| `users` | `uid`, `displayName`, `role`(`admin`\|`teacher`\|`parent`), `studentIds`, `lineUserId`, `pictureUrl` |
| `students` | `name`, `nameKana`, `birthday`, `level`, `guardianUids`, `teacherIds`, `note`, `active` |
| `teachers` | `name`, `nameKana`, `email`, `specialties[]`, `bio`, `active` |
| `lessons` | `title`, `date`(YYYY-MM-DD), `startTime`, `endTime`, `studio`, `teacherId`, `teacherName`, `level`, `capacity`, `studentIds[]` |
| `attendance` | `lessonId`, `lessonDate`, `lessonTitle`, `studentId`, `studentName`, `status`(`present`\|`absent`\|`late`\|`excused`), `note`, `recordedBy` |
| `announcements` | `title`, `body`, `audience`(`all`\|`parents`\|`teachers`), `pinned`, `authorName`, `publishedOn` |

> `attendance` のドキュメント ID は `{lessonId}_{studentId}` です。同じ組み合わせで保存すると上書き（upsert）されます。

### 推奨セキュリティルール（例）

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function role() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isStaff() { return signedIn() && role() in ['admin', 'teacher']; }

    match /users/{uid} {
      allow read: if signedIn() && (request.auth.uid == uid || isStaff());
      allow write: if signedIn() && (request.auth.uid == uid || role() == 'admin');
    }
    match /students/{id} {
      allow read: if signedIn();
      allow write: if isStaff();
    }
    match /teachers/{id} {
      allow read: if signedIn();
      allow write: if role() == 'admin';
    }
    match /lessons/{id} {
      allow read: if signedIn();
      allow write: if isStaff();
    }
    match /attendance/{id} {
      allow read: if signedIn();
      allow write: if isStaff();
    }
    match /announcements/{id} {
      allow read: if signedIn();
      allow write: if isStaff();
    }
  }
}
```

## 4. 環境変数

`.env.example` をコピーして `.env.local` を作成してください（**Vercel では Environment Variables に登録**）。

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | 〃 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | 〃 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | 〃 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | 〃 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | 〃 |
| `NEXT_PUBLIC_LIFF_ID` | ✅ | LIFF 初期化 |
| `LINE_LOGIN_CHANNEL_ID` | 任意 | サーバー側の LINE IDトークン検証 |
| `FIREBASE_ADMIN_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY` | 任意 | Firebase カスタムトークン発行 |

> Firebase の設定値はすべて `process.env.NEXT_PUBLIC_*` から読み込みます。ソースコードへの直接記載はしていません（`src/lib/env.ts` 参照）。

**環境変数が未設定の場合**は自動的に「デモモード」で起動し、サンプルデータで全画面を確認できます（データはブラウザ内のみ）。設定後は本人確認付きの LINE ログインに切り替わります。

## 5. セットアップ（ローカル）

```bash
npm install
cp .env.example .env.local   # 値を設定
npm run dev                  # http://localhost:3000
```

ビルド確認:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 6. Firebase 設定手順

1. [Firebase コンソール](https://console.firebase.google.com/)でプロジェクトを新規作成します。
2. **Authentication** を開き、「Sign-in method」で次を有効化します。
   - **匿名**（フォールバック用。推奨）
   - カスタムトークンは追加設定不要です（サービスアカウントで発行）。
3. **Firestore Database** を作成します（本番モード推奨）。リージョンは `asia-northeast1`（東京）を選ぶとアプリと相性が良いです。
4. **プロジェクトの設定 > 全般 > マイアプリ** で「ウェブ アプリ」を追加し、`firebaseConfig` の各値を控えます。
5. 控えた値を `.env.local`（および Vercel）の `NEXT_PUBLIC_FIREBASE_*` に設定します。
6. **プロジェクトの設定 > サービス アカウント > 新しい秘密鍵の生成** で JSON をダウンロードし、次を設定します。
   - `FIREBASE_ADMIN_PROJECT_ID` ← `project_id`
   - `FIREBASE_ADMIN_CLIENT_EMAIL` ← `client_email`
   - `FIREBASE_ADMIN_PRIVATE_KEY` ← `private_key`（**改行を `\n` にエスケープして1行**で貼り付け）
7. Firestore の「ルール」タブに §3 のルールを貼り付けて公開します。
8. 最初の管理者ユーザーを作るには:
   - アプリに LINE ログインして `users` コレクションにドキュメントが作成されます。
   - そのドキュメントの `role` を `admin` に書き換えます。
   - 以後は管理者画面の「権限」タブから他の利用者のロールを変更できます。
9. 管理者画面の「初期データ投入」ボタンで、講師・生徒・お知らせのサンプルを Firestore に書き込めます。

## 7. LINE Developers 設定手順

1. [LINE Developers コンソール](https://developers.line.biz/console/)にログインし、プロバイダーを作成します。
2. **LINE ログイン（Web アプリ）チャネル**を作成します（サーバー側の IDトークン検証に使用）。
   - 「チャネルID」を控え、`LINE_LOGIN_CHANNEL_ID` に設定します。
   - 「LINEログイン設定」のコールバックURLに、Vercel の本番 URL（`https://<your-app>.vercel.app/`）を登録します。
3. 同じプロバイダー配下で **LIFF アプリ**を作成します（または対象の Messaging API チャネルに LIFF を追加）。
   - **サイズ**: `Full`
   - **エンドポイントURL**: `https://<your-app>.vercel.app/`
   - **Scope**: `profile`、`openid`（IDトークンを取得するため必須）
   - **友だち追加オプション**: 必要に応じて「ON」
   - 作成後に表示される **LIFF ID** を `NEXT_PUBLIC_LIFF_ID` に設定します。
   - 「LIFF アプリを追加」したページの **チャネルID** が、IDトークン検証に使う `aud`（= `LINE_LOGIN_CHANNEL_ID`）と一致している必要があります。
4. 開発時は「開発用の LIFF URL」から動作確認できます。本番公開前にエンドポイントURLを本番URLへ更新してください。

## 8. Vercel デプロイ手順

1. このリポジトリを GitHub にプッシュします（`.gitignore` 済みのため `node_modules` / `.next` は含まれません）。
2. [Vercel](https://vercel.com/new) で「Import Git Repository」を選び、リポジトリを選択します。
3. **Framework Preset** は `Next.js` が自動検出されます。`vercel.json` に以下を記述済みのため、追加設定は不要です。

   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": "nextjs",
     "regions": ["hnd1"]
   }
   ```

4. **Environment Variables** に §4 の変数を登録します（`NEXT_PUBLIC_*` は Production / Preview / Development すべてに）。
5. **Deploy** をクリックします。以降は `main` へのプッシュで自動デプロイされます。
6. デプロイ完了後、LINE Developers のエンドポイントURL／コールバックURLを本番URLに更新します。

## 9. 技術的な補足

- **SSR 安全**: Firebase / LIFF はクライアント側でのみ初期化します（`getApps().length` ガード + 動的 `import("@line/liff")`）。プリレンダリング時に `window` へアクセスしません。
- **環境変数**: `NEXT_PUBLIC_*` はビルド時にインライン化されるため、`process.env.NEXT_PUBLIC_XXX` を直接参照しています（動的キー参照は不可）。
- **出欠の upsert**: `attendance/{lessonId}_{studentId}` に `setDoc(..., { merge: true })` で保存するため、重複レコードが発生しません。
- **スマホ最適化**: `viewportFit: "cover"` とセーフエリア対応（`.safe-top` / `.safe-bottom`）、`max-w-app`（480px）で LINE のトーク内表示に最適化しています。

## 10. スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 型チェック |
