# フォルダ構成

```
yuka-ballet-liff/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── firestore.rules            # Firestoreセキュリティルール
├── firestore.indexes.json     # 推奨インデックス
├── vercel.json
├── .env.local.example         # 環境変数テンプレート
├── docs/                      # 納品ドキュメント
│   ├── 01-firestore-design.md
│   ├── 02-screen-flow.md
│   ├── 03-folder-structure.md
│   ├── 04-vercel-deploy.md
│   └── 05-line-developers.md
└── src/
    ├── app/
    │   ├── layout.tsx              # ルートレイアウト
    │   ├── globals.css             # Tailwind + 日本語フォント
    │   ├── page.tsx                # 入口（roleでリダイレクト）
    │   ├── (student)/              # 生徒・保護者（画面下ナビ付き）
    │   │   ├── layout.tsx
    │   │   ├── home/page.tsx       # ホーム
    │   │   ├── schedule/page.tsx   # 予定確認（予約・キャンセル）
    │   │   ├── talk/page.tsx       # トーク
    │   │   ├── payments/page.tsx   # 集金
    │   │   ├── qr/page.tsx         # QR出席
    │   │   ├── profile/page.tsx    # プロフィール
    │   │   └── settings/page.tsx   # 設定（Firestore接続確認）
    │   ├── admin/                  # 管理者（role=admin のみ）
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── students/page.tsx           # 生徒一覧
    │   │   ├── lessons/page.tsx            # レッスン管理
    │   │   ├── lessons/new/page.tsx        # レッスン作成
    │   │   ├── lessons/[lessonId]/page.tsx # レッスン詳細（参加者一覧）
    │   │   ├── attendance/page.tsx         # 出席管理
    │   │   ├── announcements/page.tsx      # お知らせ管理
    │   │   └── payments/page.tsx           # 集金管理
    │   └── teacher/page.tsx        # 講師メニュー
    ├── components/
    │   ├── liff-root.tsx           # dynamic(ssr:false) ラッパー
    │   ├── liff-provider.tsx       # liff.init + ユーザー登録/更新
    │   ├── bottom-nav.tsx          # 画面下ナビ（ホーム/予定確認/トーク/集金）
    │   ├── role-guard.tsx          # 権限ガード
    │   ├── common.tsx              # ボタン・入力欄・カード等
    │   └── ui.tsx                  # ローディング・トースト・空状態
    └── lib/
        ├── liff.ts                 # LIFF SDK ラッパー
        ├── firebase.ts             # Firebase 初期化
        ├── firestore.ts            # Firestore 操作一式
        ├── types.ts                # 型定義（users/lessons/...）
        └── user-context.ts         # ユーザーコンテキスト
```
