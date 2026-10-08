# 【超入門】パソコンが苦手な方でもできる公開手順書

この手順書は「専門知識ゼロ」「ターミナル（黒い画面）は一切使わない」前提です。
ブラウザのクリック操作だけで、LINEの中にバレエ教室アプリを公開できます。

## 完成までの流れ（全体像）

1. GitHub（ファイル置き場）を作る → zipの中身をアップロード
2. Firebase（データベース）を作る → 設定値をメモ
3. Vercel（アプリの公開サービス）に連携して公開 → 仮URLが出る
4. LINE Developers で LIFF アプリを作る → 仮URLを登録
5. 発行された LIFF ID を Vercel に追加 → もう一度公開
6. Firestoreのルールを貼り付けて完了
7. 動作確認 & 自分を「管理者」に設定

必要なアカウント: Google アカウント / LINE アカウント / GitHub アカウント（すべて無料）

---

## 手順1: GitHubにファイルをアップロード

1. https://github.com/ にアクセスし、サインイン（アカウントが無ければ「Sign up」で作成）
2. 右上の「+」→「New repository」を押す
3. Repository name に `yuka-ballet-liff` と入力 →「Public」を選択 →「Create repository」
4. 次の画面で「uploading an existing file」を押す
5. ダウンロードした zip をパソコンで解凍し、中身（`src` フォルダ、`package.json` など）を全部ドラッグ＆ドロップ
   - 解凍して出てきたフォルダの中身を丸ごと入れてください。フォルダはドラッグで構造ごとアップロードできます。
6. 下の「Commit changes」を押す

これでファイル置き場が完成です。

---

## 手順2: Firebase（データベース）を作る

1. https://console.firebase.google.com/ にGoogleアカウントでサインイン
2. 「プロジェクトを追加」→ 名前は `yuka-ballet` など →「続行」→ この先はすべて「続行／作成」でOK
3. 左メニューの「構築」→「Firestore Database」→「データベースの作成」
   - ロケーションはお好みで（東京 `asia-northeast1` 推奨）→「次へ」→「本番環境モードで開始」→「作成」
4. プロジェクトの歯車アイコン →「プロジェクトの設定」
5. 下の「アプリを追加」→ ウェブ（`</>`）を選択 → ニックネームを入力 →「アプリを登録」
6. 表示された `firebaseConfig` の中の値をメモ（この7つ）

```
NEXT_PUBLIC_FIREBASE_API_KEY        → apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN    → authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID     → projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET → storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID → messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID         → appId
```

---

## 手順3: Vercel に連携して公開する

1. https://vercel.com/signup で「Continue with GitHub」を選び、GitHubで登録
2. ダッシュボードで「Add New...」→「Project」
3. 先ほど作った `yuka-ballet-liff` の「Import」を押す
4. 「Environment Variables」を開き、次の7つを1行ずつ入力（左＝名前、右＝値）
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_LIFF_ID` … これは手順4で出すので、今は空欄のままでもOK（後で追加します）
5. 「Deploy」を押す（2〜3分待つ）
6. 完了すると `https://yuka-ballet-liff-xxxx.vercel.app` のようなURLが出ます。これをメモ（仮URL）

※この時点では LINE のプロフィール取得ができないため、真っ白やエラーでも正常です。

---

## 手順4: LINE Developers で LIFF アプリを作る

1. https://developers.line.biz/console/ にLINEアカウントでサインイン
2. 「Create a new provider」→ 名前を `YUKA Ballet Art` →「Create」
3. プロバイダーを開き「Create a new channel」→「LINE Login」を選択
4. 必要項目（チャネル名 `YUKA Ballet Art`、アプリタイプは「ウェブアプリ」にチェック）を入力 → 作成
5. チャネルの「LIFF」タブ →「Add」
6. 次のように入力
   - LIFF app name: `YUKA Ballet Art`
   - Size: `Full`
   - Endpoint URL: 手順3でメモした仮URL（末尾に `/` を付ける）
   - Scopes: `profile` と `openid` にチェック
7. 保存後に表示される「LIFF ID」（`2001234567-abcdEFGh` のような文字列）をメモ

---

## 手順5: LIFF ID を Vercel に追加して再公開（ここが一番大事）

1. Vercel のプロジェクト →「Settings」→「Environment Variables」
2. `NEXT_PUBLIC_LIFF_ID` を追加し、値に手順4のLIFF IDを入力 → Save
3. 「Deployments」タブ → 一番上の右端「…」→「Redeploy」を押す
4. 完了を待つ

これで、アプリがLINEから開けるようになります。

---

## 手順6: Firestore のルールを貼り付ける

1. Firebase Console →「Firestore Database」→「ルール」タブ
2. プロジェクト内の `firestore.rules` の中身を全部コピーして貼り付け →「公開」
3. 警告が出たら、数十秒待ってからもう一度「公開」を押す

（複合インデックスが必要なときは、アプリの画面に「インデックスを作成」のリンクが表示されます。それをクリックすれば自動作成できます。）

---

## 手順7: 自分のアカウントを「管理者」にする

最初は全員が「生徒」扱いです。教室の管理者は次の手順で昇格させます。

1. まずLINEアプリから自分のLIFF URLを開いて一度ログイン（これで自分のデータが作られます）
2. Firebase Console →「Firestore Database」→「データ」タブ → `users` を開く
3. 自分の名前のドキュメントをクリックし、`role` の値を `student` から `admin` に書き換えて更新
4. アプリを開き直すと、管理者メニュー（レッスン作成など）が使えます

---

## 手順8: 動作確認

- LINEアプリでLIFF URLを開く → ホーム画面が出る
- 管理者でレッスンを作成 → 生徒側の「予定確認」から予約できる
- 定員に達すると「満席です」と表示される
- 「設定」→「接続テスト」→「Firestore接続成功」と出ればOK

---

## よくあるつまずきと対処

| 症状 | 対処 |
|---|---|
| 白い画面のまま | LIFF ID が Vercel に未設定。手順5をもう一度。 |
| 「LIFF ID が設定されていません」 | 同上。値の前後にスペースが入っていないか確認。 |
| プロフィールが出ない | LIFF の Endpoint URL が仮URLと一致しているか確認（末尾の `/` も）。 |
| 「Firestore接続失敗」 | Firebase の7つの値が正しいか、Firestore を作成済みか確認。 |
| データが読み込めない | 手順6のルール未設定。ルールを貼り付けて公開。 |
| 変更が反映されない | GitHub にアップロードし直すと、Vercel が自動で再公開します。 |
| レッスン作成で日時エラー | 終了日時は開始日時より後にしてください（仕様どおりのメッセージが出ます）。 |

---

## 今後の更新方法

GitHub のリポジトリで「Add file」→「Upload files」から該当ファイルを差し替えて「Commit changes」を押すだけで、Vercel が自動的に再公開します。黒い画面は一度も使いません。
