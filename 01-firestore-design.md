# YUKA Ballet Art — Firestore 設計書

## 1. コレクション一覧

| コレクション | 用途 | ドキュメントID |
|---|---|---|
| `users` | 会員情報（LINE連携） | LINE userId（自動採番にしない） |
| `lessons` | レッスン情報 | 自動採番（lessonId と同値をフィールドにも保持） |
| `lessonReservations` | レッスン予約 | 自動採番 |
| `announcements` | お知らせ | 自動採番 |
| `payments` | 集金 | 自動採番 |
| `test_connection` | Firestore接続確認テスト | 自動採番 |

---

## 2. users

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| uid | string | ○ | ドキュメントIDと同値（LINE userId） |
| lineUserId | string | ○ | LINE userId（`U` + 33文字） |
| displayName | string | ○ | LINE表示名 |
| pictureUrl | string \| null | − | LINEアイコンURL |
| role | string | ○ | `student` / `teacher` / `admin`（初回ログイン時は `student`） |
| memberNumber | string | − | 会員番号（管理者が事後設定） |
| className | string | − | 所属クラス |
| createdAt | timestamp | ○ | 初回ログイン日時（serverTimestamp） |
| lastLoginAt | timestamp | ○ | 最終ログイン日時（再ログイン時に更新） |

## 3. lessons

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| lessonId | string | ○ | ドキュメントIDと同値 |
| title | string | ○ | レッスン名 |
| className | string | ○ | クラス名 |
| teacherName | string | ○ | 担当講師 |
| startAt | timestamp | ○ | 開始日時 |
| endAt | timestamp | ○ | 終了日時（開始より後であること） |
| capacity | number | ○ | 定員 |
| reservedCount | number | ○ | 予約人数（トランザクションで増減） |
| notificationType | string | ○ | `none` / `at_end` / `before_15m` / `before_30m` / `before_60m` |
| createdAt | timestamp | ○ | 作成日時 |
| updatedAt | timestamp | ○ | 更新日時 |

### notificationType の値と意味

| 値 | 意味 |
|---|---|
| `none` | 通知しない |
| `at_end` | 終了時刻ちょうど |
| `before_15m` | 終了15分前 |
| `before_30m` | 終了30分前 |
| `before_60m` | 終了60分前 |

※ 通知の実際の送信は Cloud Functions（Pub/Sub スケジューラ + FCM/LINE Messaging API）で行う想定。

## 4. lessonReservations

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| reservationId | string | ○ | ドキュメントIDと同値 |
| lessonId | string | ○ | 対象レッスン |
| userId | string | ○ | 予約者の LINE userId |
| displayName | string | ○ | 予約時の氏名（スナップショット） |
| memberNumber | string | ○ | 会員番号（スナップショット） |
| reservedAt | timestamp | ○ | 予約日時 |
| attendanceStatus | string | ○ | `reserved`（予約済み）/ `attended`（出席）/ `absent`（欠席） |

## 5. announcements

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| announcementId | string | ○ | ドキュメントIDと同値 |
| title | string | ○ | タイトル |
| content | string | ○ | 本文 |
| createdAt | timestamp | ○ | 公開日時 |
| publishedBy | string | ○ | 公開者（管理者氏名） |

## 6. payments

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| paymentId | string | ○ | ドキュメントIDと同値 |
| userId | string | ○ | 対象生徒 |
| displayName | string | ○ | 氏名 |
| memberNumber | string | ○ | 会員番号 |
| title | string | ○ | 項目名（例: 9月月謝） |
| amount | number | ○ | 金額（円） |
| dueDate | timestamp \| null | − | 支払期限 |
| status | string | ○ | `unpaid` / `paid` |
| createdAt | timestamp | ○ | 作成日時 |

## 7. test_connection（接続確認専用）

| フィールド | 型 | 説明 |
|---|---|---|
| timestamp | timestamp | 書き込み時刻（serverTimestamp） |
| projectId | string | Firebase Project ID |

## 8. 複合インデックス（推奨）

- `lessonReservations`: `userId ASC, reservedAt DESC`
- `lessonReservations`: `lessonId ASC, reservedAt ASC`
- `lessons`: `startAt ASC`（単一フィールドのため自動）

## 9. セキュリティ設計の要点

1. 認証はすべて LINE userId をキーにする（`request.auth.uid == LINE userId`）。
2. `role` / `memberNumber` / `className` は本人でも変更不可（管理者のみ）。
3. `lessons` の `reservedCount` はクライアント direct 書き込み不可 → `runTransaction` 経由でのみ更新。
4. `test_connection` は書き込みのみ可、読み取りは管理者のみ。
