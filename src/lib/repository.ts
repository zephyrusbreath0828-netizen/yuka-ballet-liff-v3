import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { isFirebaseConfigured } from "./env";
import {
  COLLECTIONS,
  type Announcement,
  type AnnouncementDoc,
  type Attendance,
  type AttendanceDoc,
  type AttendanceStatus,
  type Lesson,
  type LessonDoc,
  type Role,
  type Student,
  type StudentDoc,
  type Teacher,
  type TeacherDoc,
  type UserProfile,
} from "./types";
import {
  mockAnnouncements,
  mockAttendance,
  mockLessons,
  mockStudents,
  mockTeachers,
  mockUsers,
} from "./mock";

/**
 * データアクセス層。
 *
 * - Firebase 設定済み → Firestore（クライアント SDK / ログインユーザー権限）
 * - 未設定 → メモリ上のデモデータ（モジュール変数・リロードでリセット）
 *
 * UI 側はこのレイヤーの関数だけを呼び出し、環境差異を意識しない。
 */

export const DEMO_MODE = !isFirebaseConfigured();

/* デモデータ用のインメモリストア */
const demoStore = {
  students: [...mockStudents],
  teachers: [...mockTeachers],
  lessons: [...mockLessons],
  attendance: [...mockAttendance],
  announcements: [...mockAnnouncements],
  users: [...mockUsers],
};

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function snapshotOf<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function byLessonDateDesc(a: Attendance, b: Attendance): number {
  return b.lessonDate.localeCompare(a.lessonDate);
}

/* ------------------------------------------------------------------ */
/* students                                                           */
/* ------------------------------------------------------------------ */
export type StudentInput = Omit<StudentDoc, "createdAt">;

export async function fetchStudents(): Promise<Student[]> {
  if (DEMO_MODE) return snapshotOf(demoStore.students);
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.students), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as StudentDoc) }));
}

export async function fetchStudent(id: string): Promise<Student | null> {
  if (DEMO_MODE) return demoStore.students.find((s) => s.id === id) ?? null;
  const ref = await getDoc(doc(getDb(), COLLECTIONS.students, id));
  if (!ref.exists()) return null;
  return { id: ref.id, ...(ref.data() as StudentDoc) };
}

export async function createStudent(input: StudentInput): Promise<string> {
  if (DEMO_MODE) {
    const created: Student = { id: newId("student"), ...input };
    demoStore.students = [created, ...demoStore.students];
    return created.id;
  }
  const payload = { ...input, createdAt: serverTimestamp() };
  const ref = await addDoc(
    collection(getDb(), COLLECTIONS.students),
    payload as unknown as DocumentData,
  );
  return ref.id;
}

export async function updateStudent(
  id: string,
  patch: Partial<StudentInput>,
): Promise<void> {
  if (DEMO_MODE) {
    demoStore.students = demoStore.students.map((s) => (s.id === id ? { ...s, ...patch } : s));
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.students, id), {
    ...patch,
    updatedAt: serverTimestamp(),
  } as unknown as DocumentData);
}

export async function deleteStudent(id: string): Promise<void> {
  if (DEMO_MODE) {
    demoStore.students = demoStore.students.filter((s) => s.id !== id);
    return;
  }
  await deleteDoc(doc(getDb(), COLLECTIONS.students, id));
}

/* ------------------------------------------------------------------ */
/* teachers                                                           */
/* ------------------------------------------------------------------ */
export type TeacherInput = Omit<TeacherDoc, "createdAt">;

export async function fetchTeachers(): Promise<Teacher[]> {
  if (DEMO_MODE) return snapshotOf(demoStore.teachers);
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.teachers), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as TeacherDoc) }));
}

export async function createTeacher(input: TeacherInput): Promise<string> {
  if (DEMO_MODE) {
    const created: Teacher = { id: newId("teacher"), ...input };
    demoStore.teachers = [created, ...demoStore.teachers];
    return created.id;
  }
  const ref = await addDoc(collection(getDb(), COLLECTIONS.teachers), {
    ...input,
    createdAt: serverTimestamp(),
  } as unknown as DocumentData);
  return ref.id;
}

/* ------------------------------------------------------------------ */
/* lessons                                                            */
/* ------------------------------------------------------------------ */
export type LessonInput = Omit<LessonDoc, "createdAt">;

export async function fetchLessons(): Promise<Lesson[]> {
  if (DEMO_MODE) {
    return snapshotOf(demoStore.lessons).sort((a, b) => a.date.localeCompare(b.date));
  }
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.lessons), orderBy("date", "asc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as LessonDoc) }));
}

export async function fetchLesson(id: string): Promise<Lesson | null> {
  if (DEMO_MODE) return demoStore.lessons.find((l) => l.id === id) ?? null;
  const ref = await getDoc(doc(getDb(), COLLECTIONS.lessons, id));
  if (!ref.exists()) return null;
  return { id: ref.id, ...(ref.data() as LessonDoc) };
}

export async function createLesson(input: LessonInput): Promise<string> {
  if (DEMO_MODE) {
    const created: Lesson = { id: newId("lesson"), ...input };
    demoStore.lessons = [...demoStore.lessons, created];
    return created.id;
  }
  const ref = await addDoc(collection(getDb(), COLLECTIONS.lessons), {
    ...input,
    createdAt: serverTimestamp(),
  } as unknown as DocumentData);
  return ref.id;
}

/* ------------------------------------------------------------------ */
/* attendance                                                         */
/* ------------------------------------------------------------------ */
export interface AttendanceInput {
  lessonId: string;
  lessonDate: string;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  recordedBy?: string;
}

export function attendanceDocId(lessonId: string, studentId: string): string {
  return `${lessonId}_${studentId}`;
}

export async function fetchAttendanceByStudent(studentId: string): Promise<Attendance[]> {
  if (DEMO_MODE) {
    return snapshotOf(
      demoStore.attendance.filter((a) => a.studentId === studentId),
    ).sort(byLessonDateDesc);
  }
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.attendance),
      where("studentId", "==", studentId),
    ),
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as AttendanceDoc) }))
    .sort(byLessonDateDesc);
}

export async function fetchAttendanceByLesson(lessonId: string): Promise<Attendance[]> {
  if (DEMO_MODE) {
    return snapshotOf(demoStore.attendance.filter((a) => a.lessonId === lessonId));
  }
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.attendance), where("lessonId", "==", lessonId)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AttendanceDoc) }));
}

export async function fetchAttendance(): Promise<Attendance[]> {
  if (DEMO_MODE) return snapshotOf(demoStore.attendance).sort(byLessonDateDesc);
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.attendance), orderBy("lessonDate", "desc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AttendanceDoc) }));
}

/** 出欠を一括保存（lessonId + studentId をキーに upsert） */
export async function saveAttendance(records: AttendanceInput[]): Promise<void> {
  if (records.length === 0) return;
  if (DEMO_MODE) {
    const next = [...demoStore.attendance];
    for (const record of records) {
      const id = attendanceDocId(record.lessonId, record.studentId);
      const index = next.findIndex((a) => a.id === id);
      const merged: Attendance = { id, ...record };
      if (index >= 0) next[index] = merged;
      else next.push(merged);
    }
    demoStore.attendance = next;
    return;
  }
  const db = getDb();
  await Promise.all(
    records.map((record) =>
      setDoc(
        doc(db, COLLECTIONS.attendance, attendanceDocId(record.lessonId, record.studentId)),
        { ...record, updatedAt: serverTimestamp() } as unknown as DocumentData,
        { merge: true },
      ),
    ),
  );
}

/* ------------------------------------------------------------------ */
/* announcements                                                      */
/* ------------------------------------------------------------------ */
export type AnnouncementInput = Omit<AnnouncementDoc, "createdAt">;

export async function fetchAnnouncements(): Promise<Announcement[]> {
  if (DEMO_MODE) {
    return snapshotOf(demoStore.announcements).sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.publishedOn.localeCompare(a.publishedOn);
    });
  }
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.announcements), orderBy("publishedOn", "desc")),
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as AnnouncementDoc) }))
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
}

export async function fetchAnnouncement(id: string): Promise<Announcement | null> {
  if (DEMO_MODE) return demoStore.announcements.find((a) => a.id === id) ?? null;
  const ref = await getDoc(doc(getDb(), COLLECTIONS.announcements, id));
  if (!ref.exists()) return null;
  return { id: ref.id, ...(ref.data() as AnnouncementDoc) };
}

export async function createAnnouncement(input: AnnouncementInput): Promise<string> {
  if (DEMO_MODE) {
    const created: Announcement = { id: newId("announcement"), ...input };
    demoStore.announcements = [created, ...demoStore.announcements];
    return created.id;
  }
  const ref = await addDoc(collection(getDb(), COLLECTIONS.announcements), {
    ...input,
    createdAt: serverTimestamp(),
  } as unknown as DocumentData);
  return ref.id;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (DEMO_MODE) {
    demoStore.announcements = demoStore.announcements.filter((a) => a.id !== id);
    return;
  }
  await deleteDoc(doc(getDb(), COLLECTIONS.announcements, id));
}

/* ------------------------------------------------------------------ */
/* users                                                              */
/* ------------------------------------------------------------------ */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (DEMO_MODE) return demoStore.users.find((u) => u.uid === uid) ?? null;
  const ref = await getDoc(doc(getDb(), COLLECTIONS.users, uid));
  if (!ref.exists()) return null;
  const data = ref.data() as UserProfile;
  return { ...data, id: ref.id };
}

export interface UpsertUserInput {
  uid: string;
  displayName: string;
  lineUserId?: string;
  pictureUrl?: string;
  email?: string;
  role: Role;
  studentIds?: string[];
}

export async function upsertUserProfile(input: UpsertUserInput): Promise<UserProfile> {
  if (DEMO_MODE) {
    const existing = demoStore.users.find((u) => u.uid === input.uid);
    const merged: UserProfile = {
      id: input.uid,
      createdAt: null,
      ...existing,
      ...input,
    };
    demoStore.users = [merged, ...demoStore.users.filter((u) => u.uid !== input.uid)];
    return merged;
  }
  await setDoc(
    doc(getDb(), COLLECTIONS.users, input.uid),
    { ...input, updatedAt: serverTimestamp() } as unknown as DocumentData,
    { merge: true },
  );
  return { ...input, id: input.uid };
}

export async function listUsers(): Promise<UserProfile[]> {
  if (DEMO_MODE) return snapshotOf(demoStore.users);
  const snap = await getDocs(collection(getDb(), COLLECTIONS.users));
  return snap.docs.map((d) => {
    const data = d.data() as UserProfile;
    return { ...data, id: d.id };
  });
}

export async function updateUserRole(uid: string, role: Role): Promise<void> {
  if (DEMO_MODE) {
    demoStore.users = demoStore.users.map((u) => (u.uid === uid ? { ...u, role } : u));
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.users, uid), {
    role,
    updatedAt: serverTimestamp(),
  } as unknown as DocumentData);
}

/* ------------------------------------------------------------------ */
/* seed                                                               */
/* ------------------------------------------------------------------ */
const SEED_TEACHERS: Array<{ id: string } & TeacherInput> = [
  {
    id: "teacher-yuka",
    name: "佐藤 由佳",
    nameKana: "サトウ ユカ",
    email: "yuka@example.com",
    specialties: ["クラシックバレエ", "ポアント", "コンクール指導"],
    bio: "YUKA Ballet Art 主宰。全クラスの指導と振付を担当。",
    active: true,
  },
  {
    id: "teacher-emily",
    name: "Emily Carter",
    nameKana: "エミリー カーター",
    email: "emily@example.com",
    specialties: ["モダンダンス", "ストレッチ", "キッズ"],
    bio: "キッズクラスとコンテンポラリーを担当。",
    active: true,
  },
];

const SEED_STUDENTS: Array<{ id: string } & StudentInput> = [
  {
    id: "student-001",
    name: "山田 さくら",
    nameKana: "ヤマダ サクラ",
    birthday: "2015-04-12",
    level: "intermediate",
    teacherIds: ["teacher-yuka"],
    note: "トウシューズ移行準備中。",
    active: true,
  },
  {
    id: "student-002",
    name: "鈴木 ひかり",
    nameKana: "スズキ ヒカリ",
    birthday: "2013-09-30",
    level: "advanced",
    teacherIds: ["teacher-yuka"],
    note: "コンクール出場予定。",
    active: true,
  },
];

/** Firestore にデモデータを投入する（本人が admin ロールでログイン済みであること） */
export async function seedDemoData(): Promise<number> {
  if (DEMO_MODE) {
    demoStore.students = [...mockStudents];
    demoStore.teachers = [...mockTeachers];
    demoStore.lessons = [...mockLessons];
    demoStore.announcements = [...mockAnnouncements];
    return 4;
  }
  const db = getDb();
  let count = 0;

  for (const teacher of SEED_TEACHERS) {
    const { id, ...rest } = teacher;
    await setDoc(
      doc(db, COLLECTIONS.teachers, id),
      { ...rest, createdAt: serverTimestamp() } as unknown as DocumentData,
      { merge: true },
    );
    count += 1;
  }
  for (const student of SEED_STUDENTS) {
    const { id, ...rest } = student;
    await setDoc(
      doc(db, COLLECTIONS.students, id),
      { ...rest, createdAt: serverTimestamp() } as unknown as DocumentData,
      { merge: true },
    );
    count += 1;
  }
  for (const announcement of mockAnnouncements.slice(0, 2)) {
    await setDoc(
      doc(db, COLLECTIONS.announcements, announcement.id),
      {
        title: announcement.title,
        body: announcement.body,
        audience: announcement.audience,
        pinned: announcement.pinned,
        authorName: announcement.authorName,
        publishedOn: announcement.publishedOn,
        createdAt: serverTimestamp(),
      } as unknown as DocumentData,
      { merge: true },
    );
    count += 1;
  }
  return count;
}

/** ダッシュボード用の件数集計 */
export interface DashboardStats {
  students: number;
  teachers: number;
  lessons: number;
  announcements: number;
}

export async function fetchStats(): Promise<DashboardStats> {
  const [students, teachers, lessons, announcements] = await Promise.all([
    fetchStudents(),
    fetchTeachers(),
    fetchLessons(),
    fetchAnnouncements(),
  ]);
  return {
    students: students.length,
    teachers: teachers.length,
    lessons: lessons.length,
    announcements: announcements.length,
  };
}
