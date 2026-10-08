# YUKA Ballet Art — 画面遷移図

```mermaid
flowchart TD
    Launch[LINEミニアプリ起動<br/>liff.init] --> Login[LIFF認証<br/>LINEプロフィール取得]
    Login --> Root{/ role判定 /}
    Root -->|student| HomeS
    Root -->|teacher| Teacher[講師メニュー<br/>/teacher]
    Root -->|admin| Admin[管理者メニュー<br/>/admin]

    subgraph 生徒・保護者
      HomeS[ホーム /home<br/>レッスン予定・お知らせ・<br/>予約一覧・QR出席] --> Schedule[予定確認 /schedule<br/>予約・キャンセル]
      HomeS --> Talk[トーク /talk]
      HomeS --> Payments[集金 /payments]
      HomeS --> QR[QR出席 /qr]
      Schedule --> HomeS
    end

    HomeS --> Profile[プロフィール /profile<br/>アイコン・氏名・会員種別・<br/>会員番号・所属クラス]
    Profile --> Settings[設定 /settings<br/>Firestore接続確認]

    subgraph 管理者
      Admin --> Students[生徒一覧 /admin/students<br/>権限変更]
      Admin --> ALessons[レッスン管理 /admin/lessons]
      ALessons --> NewLesson[レッスン作成 /admin/lessons/new]
      ALessons --> LD[レッスン詳細 /admin/lessons/:id<br/>参加者一覧・参加人数・残席数]
      Admin --> Attendance[出席管理 /admin/attendance]
      Attendance --> LD
      Admin --> Ann[お知らせ管理 /admin/announcements]
      Admin --> APay[集金管理 /admin/payments]
      Admin --> Settings
    end

    subgraph 講師
      Teacher --> LD
    end
```

## 画面下ナビ（生徒・保護者）

| タブ | パス | 内容 |
|---|---|---|
| ホーム | `/home` | レッスン予定・お知らせ・自分の予約一覧・QR出席 |
| 予定確認 | `/schedule` | レッスン予約／キャンセル（満席時「満席です」） |
| トーク | `/talk` | LINE公式アカウントのトークを開く |
| 集金 | `/payments` | 未払い・支払い済みの一覧 |
