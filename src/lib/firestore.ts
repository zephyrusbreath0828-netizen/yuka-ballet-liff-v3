import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Announcement,
  AppUser,
  Lesson,
  LessonReservation,
  NotificationType,
  Payment,
  Role,
} from "./types";

const usersCol = collection(db, "users");
const lessonsCol = collection(db, "lessons");
const reservationsCol = collection(db, "lessonReservations");
const announcementsCol = collection(db, "announcements");
const paymentsCol = collection(db, "payments");

function tsToDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

export function formatDateTime(value: unknown): string {
  const d = tsToDate(value);
  if (!d) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/* ---------------------------------- users ---------------------------------- */

/**
 * LINEログイン直後に呼び出す。Firebase Web SDK のみで完結し、サーバーAPIは使わない。
 * - users/{lineUserId} が無ければ自動作成（createdAt を設定）
 * - 既にあれば lastLoginAt / updatedAt を更新（既存フィールドは保持）
 * setDoc + merge:true のため、再ログインで role や memberNumber が消えない。
 */
export async function upsertUserOnLogin(profile: {
  userId: string;
  displayName: string;
  pictureUrl: string | null;
}): Promise<AppUser | null> {
  const ref = doc(db, "users", profile.userId);
  const snap = await getDoc(ref);
  const exists = snap.exists();

  await setDoc(
    ref,
    {
      uid: profile.userId,
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // 初回のみ既定値を設定（merge:true のため既存値は上書きされない）
      ...(exists
        ? {}
        : {
            role: "student" as Role,
            memberNumber: "",
            className: "",
            createdAt: serverTimestamp(),
          }),
    },
    { merge: true }
  );

  const fresh = await getDoc(ref);
  return fresh.exists() ? (fresh.data() as AppUser) : null;
}

export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function listUsers(): Promise<AppUser[]> {
  const snap = await getDocs(usersCol);
  return snap.docs.map((d) => d.data() as AppUser);
}

export async function updateUserRole(uid: string, role: Role): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

/* --------------------------------- lessons --------------------------------- */

export type LessonInput = {
  title: string;
  className: string;
  teacherName: string;
  startAt: Date;
  endAt: Date;
  capacity: number;
  notificationType: NotificationType;
};

export async function createLesson(input: LessonInput): Promise<string> {
  const ref = await addDoc(lessonsCol, {
    title: input.title,
    className: input.className,
    teacherName: input.teacherName,
    startAt: Timestamp.fromDate(input.startAt),
    endAt: Timestamp.fromDate(input.endAt),
    capacity: input.capacity,
    reservedCount: 0,
    notificationType: input.notificationType,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(ref, { lessonId: ref.id });
  return ref.id;
}

export async function updateLesson(
  lessonId: string,
  input: Partial<LessonInput>
): Promise<void> {
  const data: Record<string, unknown> = { ...input, updatedAt: serverTimestamp() };
  if (input.startAt) data.startAt = Timestamp.fromDate(input.startAt);
  if (input.endAt) data.endAt = Timestamp.fromDate(input.endAt);
  await updateDoc(doc(db, "lessons", lessonId), data);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await deleteDoc(doc(db, "lessons", lessonId));
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const snap = await getDoc(doc(db, "lessons", lessonId));
  return snap.exists() ? ({ lessonId: snap.id, ...snap.data() } as Lesson) : null;
}

export async function listLessons(): Promise<Lesson[]> {
  const snap = await getDocs(query(lessonsCol, orderBy("startAt", "asc")));
  return snap.docs.map((d) => ({ lessonId: d.id, ...d.data() } as Lesson));
}

export async function listLessonsAfterNow(): Promise<Lesson[]> {
  const now = new Date();
  const snap = await getDocs(
    query(lessonsCol, where("startAt", ">=", now), orderBy("startAt", "asc"))
  );
  return snap.docs.map((d) => ({ lessonId: d.id, ...d.data() } as Lesson));
}

/* ------------------------------ reservations ------------------------------- */

/**
 * レッスン予約（トランザクションで定員チェック）。
 * 定員超過時は null を返す（UI側で「満席です」を表示）。
 */
export async function reserveLesson(
  lesson: Lesson,
  user: AppUser
): Promise<"ok" | "full" | "error"> {
  try {
    await runTransaction(db, async (tx) => {
      const lessonRef = doc(db, "lessons", lesson.lessonId);
      const fresh = await tx.get(lessonRef);
      if (!fresh.exists()) throw new Error("LESSON_NOT_FOUND");
      const data = fresh.data() as DocumentData;
      const capacity = Number(data.capacity ?? 0);
      const reservedCount = Number(data.reservedCount ?? 0);
      if (reservedCount >= capacity) return; // 定員超過 → 予約不可
      tx.update(lessonRef, { reservedCount: reservedCount + 1 });
      tx.set(doc(reservationsCol), {
        lessonId: lesson.lessonId,
        userId: user.uid,
        displayName: user.displayName,
        memberNumber: user.memberNumber,
        reservedAt: serverTimestamp(),
        attendanceStatus: "reserved",
      });
    });
    return "ok";
  } catch (e) {
    if (e instanceof Error && e.message === "LESSON_NOT_FOUND") return "error";
    return "error";
  }
}

export async function cancelReservation(
  reservation: LessonReservation
): Promise<void> {
  await runTransaction(db, async (tx) => {
    tx.delete(doc(db, "lessonReservations", reservation.reservationId));
    const lessonRef = doc(db, "lessons", reservation.lessonId);
    const fresh = await tx.get(lessonRef);
    if (fresh.exists()) {
      const current = Number((fresh.data() as DocumentData).reservedCount ?? 0);
      tx.update(lessonRef, { reservedCount: Math.max(0, current - 1) });
    }
  });
}

export async function listReservationsByUser(
  userId: string
): Promise<LessonReservation[]> {
  const snap = await getDocs(
    query(
      reservationsCol,
      where("userId", "==", userId),
      orderBy("reservedAt", "desc")
    )
  );
  return snap.docs.map((d) => ({
    reservationId: d.id,
    ...d.data(),
  } as LessonReservation));
}

export async function listReservationsByLesson(
  lessonId: string
): Promise<LessonReservation[]> {
  const snap = await getDocs(
    query(
      reservationsCol,
      where("lessonId", "==", lessonId),
      orderBy("reservedAt", "asc")
    )
  );
  return snap.docs.map((d) => ({
    reservationId: d.id,
    ...d.data(),
  } as LessonReservation));
}

export async function setAttendanceStatus(
  reservationId: string,
  status: LessonReservation["attendanceStatus"]
): Promise<void> {
  await updateDoc(doc(db, "lessonReservations", reservationId), {
    attendanceStatus: status,
  });
}

/* ------------------------------ announcements ------------------------------ */

export async function createAnnouncement(
  title: string,
  content: string,
  publishedBy: string
): Promise<void> {
  await addDoc(announcementsCol, {
    title,
    content,
    createdAt: serverTimestamp(),
    publishedBy,
  });
}

export async function listAnnouncements(): Promise<Announcement[]> {
  const snap = await getDocs(
    query(announcementsCol, orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({
    announcementId: d.id,
    ...d.data(),
  } as Announcement));
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, "announcements", id));
}

/* --------------------------------- payments -------------------------------- */

export async function createPayment(input: {
  userId: string;
  displayName: string;
  memberNumber: string;
  title: string;
  amount: number;
  dueDate: Date | null;
}): Promise<void> {
  await addDoc(paymentsCol, {
    ...input,
    dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
    status: "unpaid",
    createdAt: serverTimestamp(),
  });
}

export async function listPaymentsByUser(userId: string): Promise<Payment[]> {
  const snap = await getDocs(
    query(paymentsCol, where("userId", "==", userId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ paymentId: d.id, ...d.data() } as Payment));
}

export async function listAllPayments(): Promise<Payment[]> {
  const snap = await getDocs(query(paymentsCol, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ paymentId: d.id, ...d.data() } as Payment));
}

export async function setPaymentStatus(
  paymentId: string,
  status: Payment["status"]
): Promise<void> {
  await updateDoc(doc(db, "payments", paymentId), { status });
}

export async function deletePayment(paymentId: string): Promise<void> {
  await deleteDoc(doc(db, "payments", paymentId));
}

/* ----------------------------- test_connection ----------------------------- */

export async function writeTestConnection(
  projectId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ref = await addDoc(collection(db, "test_connection"), {
      timestamp: serverTimestamp(),
      projectId,
    });
    return { ok: true, id: ref.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
