import type { Timestamp } from "firebase/firestore";

/** ロール（権限） */
export type Role = "admin" | "teacher" | "parent";

/** 出欠ステータス */
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

/** 生徒のレベル */
export type Level = "kids" | "beginner" | "intermediate" | "advanced";

/** お知らせの配信対象 */
export type Audience = "all" | "parents" | "teachers";

/** Firestore コレクション名 */
export const COLLECTIONS = {
  users: "users",
  students: "students",
  teachers: "teachers",
  lessons: "lessons",
  attendance: "attendance",
  announcements: "announcements",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "管理者",
  teacher: "講師",
  parent: "保護者",
};

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "出席",
  absent: "欠席",
  late: "遅刻",
  excused: "公欠",
};

export const LEVEL_LABEL: Record<Level, string> = {
  kids: "キッズ",
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export const AUDIENCE_LABEL: Record<Audience, string> = {
  all: "全員",
  parents: "保護者",
  teachers: "講師",
};

/* ------------------------------------------------------------------ */
/* users                                                              */
/* ------------------------------------------------------------------ */
export interface UserDoc {
  uid: string;
  lineUserId?: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
  role: Role;
  studentIds?: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}
export interface UserProfile extends UserDoc {
  id: string;
}

/* ------------------------------------------------------------------ */
/* students                                                           */
/* ------------------------------------------------------------------ */
export interface StudentDoc {
  name: string;
  nameKana: string;
  birthday?: string;
  level: Level;
  guardianUids?: string[];
  teacherIds?: string[];
  note?: string;
  active: boolean;
  createdAt?: Timestamp | null;
}
export interface Student extends StudentDoc {
  id: string;
}

/* ------------------------------------------------------------------ */
/* teachers                                                           */
/* ------------------------------------------------------------------ */
export interface TeacherDoc {
  name: string;
  nameKana: string;
  email?: string;
  specialties: string[];
  bio?: string;
  active: boolean;
  createdAt?: Timestamp | null;
}
export interface Teacher extends TeacherDoc {
  id: string;
}

/* ------------------------------------------------------------------ */
/* lessons                                                            */
/* ------------------------------------------------------------------ */
export interface LessonDoc {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
  studio: string;
  teacherId: string;
  teacherName: string;
  level: Level;
  capacity: number;
  studentIds: string[];
  createdAt?: Timestamp | null;
}
export interface Lesson extends LessonDoc {
  id: string;
}

/* ------------------------------------------------------------------ */
/* attendance                                                         */
/* ------------------------------------------------------------------ */
export interface AttendanceDoc {
  lessonId: string;
  lessonDate: string;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  recordedBy?: string;
  updatedAt?: Timestamp | null;
}
export interface Attendance extends AttendanceDoc {
  id: string;
}

/* ------------------------------------------------------------------ */
/* announcements                                                      */
/* ------------------------------------------------------------------ */
export interface AnnouncementDoc {
  title: string;
  body: string;
  audience: Audience;
  pinned: boolean;
  authorName: string;
  /** YYYY-MM-DD */
  publishedOn: string;
  createdAt?: Timestamp | null;
}
export interface Announcement extends AnnouncementDoc {
  id: string;
}
