export type Role = "student" | "teacher" | "admin";

/** users コレクション */
export type AppUser = {
  uid: string; // Firestore docId = LINE userId
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  role: Role;
  memberNumber: string; // 会員番号
  className: string; // 所属クラス
  createdAt?: unknown; // Timestamp（初回ログイン時のみ設定）
  lastLoginAt?: unknown; // Timestamp（再ログインのたびに更新）
  updatedAt?: unknown; // Timestamp
};

/** lessons コレクション */
export type Lesson = {
  lessonId: string; // docId
  title: string;
  className: string;
  teacherName: string;
  startAt: TimestampLike; // Timestamp
  endAt: TimestampLike; // Timestamp
  capacity: number;
  reservedCount: number;
  notificationType: NotificationType;
  createdAt?: unknown;
  updatedAt?: unknown;
};

/** 通知タイミング */
export const NOTIFICATION_TYPES = [
  "none",
  "at_end",
  "before_15m",
  "before_30m",
  "before_60m",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  none: "通知しない",
  at_end: "終了時刻ちょうど",
  before_15m: "終了15分前",
  before_30m: "終了30分前",
  before_60m: "終了60分前",
};

/** lessonReservations コレクション */
export type LessonReservation = {
  reservationId: string; // docId
  lessonId: string;
  userId: string; // LINE userId
  displayName: string;
  memberNumber: string;
  reservedAt: TimestampLike;
  attendanceStatus: AttendanceStatus;
};

export type AttendanceStatus = "reserved" | "attended" | "absent";

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  reserved: "予約済み",
  attended: "出席",
  absent: "欠席",
};

/** announcements コレクション */
export type Announcement = {
  announcementId: string; // docId
  title: string;
  content: string;
  createdAt: TimestampLike;
  publishedBy: string;
};

/** payments コレクション */
export type Payment = {
  paymentId: string; // docId
  userId: string;
  displayName: string;
  memberNumber: string;
  title: string; // 項目名 (例: 8月月謝)
  amount: number;
  dueDate: TimestampLike | null;
  status: PaymentStatus;
  createdAt: TimestampLike;
};

export type PaymentStatus = "unpaid" | "paid";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "未払い",
  paid: "支払い済み",
};

/** test_connection コレクション */
export type TestConnection = {
  timestamp: unknown; // serverTimestamp
  projectId: string;
};

/** Firestore Timestamp の代わりに unknown を許容する便宜型 */
export type TimestampLike = unknown;
