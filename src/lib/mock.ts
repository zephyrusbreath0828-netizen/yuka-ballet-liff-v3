import type {
  Announcement,
  Attendance,
  Lesson,
  Student,
  Teacher,
  UserProfile,
} from "./types";
import { todayISO } from "./format";

/**
 * 環境変数（Firebase）が未設定のときに使うデモデータ。
 * 実際の Firestore には一切書き込まれません。
 */

function shiftDate(base: string, days: number): string {
  const [y, m, d] = base.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

const base = todayISO();

export const mockTeachers: Teacher[] = [
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
  {
    id: "teacher-hana",
    name: "田中 華",
    nameKana: "タナカ ハナ",
    email: "hana@example.com",
    specialties: ["初級", "Jr.クラス"],
    bio: "初級・ジュニアクラスの基礎指導を担当。",
    active: true,
  },
];

export const mockStudents: Student[] = [
  {
    id: "student-001",
    name: "山田 さくら",
    nameKana: "ヤマダ サクラ",
    birthday: "2015-04-12",
    level: "intermediate",
    guardianUids: ["parent-demo"],
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
    guardianUids: ["parent-demo"],
    teacherIds: ["teacher-yuka"],
    note: "コンクール出場予定。",
    active: true,
  },
  {
    id: "student-003",
    name: "高橋 めい",
    nameKana: "タカハシ メイ",
    birthday: "2017-01-22",
    level: "kids",
    guardianUids: ["parent-demo-2"],
    teacherIds: ["teacher-emily"],
    active: true,
  },
  {
    id: "student-004",
    name: "伊藤 りん",
    nameKana: "イトウ リン",
    birthday: "2016-07-08",
    level: "beginner",
    guardianUids: ["parent-demo-2"],
    teacherIds: ["teacher-hana"],
    active: true,
  },
  {
    id: "student-005",
    name: "渡辺 かえで",
    nameKana: "ワタナベ カエデ",
    birthday: "2014-11-03",
    level: "intermediate",
    guardianUids: ["parent-demo-3"],
    teacherIds: ["teacher-yuka", "teacher-emily"],
    active: true,
  },
  {
    id: "student-006",
    name: "中村 ゆづき",
    nameKana: "ナカムラ ユヅキ",
    birthday: "2018-05-19",
    level: "kids",
    guardianUids: ["parent-demo-3"],
    teacherIds: ["teacher-emily"],
    note: "体験レッスンから入会。",
    active: true,
  },
];

export const mockLessons: Lesson[] = [
  {
    id: "lesson-001",
    title: "Jr.クラス（中級）",
    date: shiftDate(base, 1),
    startTime: "17:00",
    endTime: "18:30",
    studio: "スタジオA",
    teacherId: "teacher-yuka",
    teacherName: "佐藤 由佳",
    level: "intermediate",
    capacity: 12,
    studentIds: ["student-001", "student-005"],
  },
  {
    id: "lesson-002",
    title: "キッズクラス",
    date: shiftDate(base, 1),
    startTime: "16:00",
    endTime: "16:50",
    studio: "スタジオB",
    teacherId: "teacher-emily",
    teacherName: "Emily Carter",
    level: "kids",
    capacity: 10,
    studentIds: ["student-003", "student-006"],
  },
  {
    id: "lesson-003",
    title: "アドバンスクラス",
    date: shiftDate(base, 3),
    startTime: "18:30",
    endTime: "20:30",
    studio: "スタジオA",
    teacherId: "teacher-yuka",
    teacherName: "佐藤 由佳",
    level: "advanced",
    capacity: 8,
    studentIds: ["student-002", "student-005"],
  },
  {
    id: "lesson-004",
    title: "初級クラス",
    date: shiftDate(base, 5),
    startTime: "17:00",
    endTime: "18:00",
    studio: "スタジオB",
    teacherId: "teacher-hana",
    teacherName: "田中 華",
    level: "beginner",
    capacity: 12,
    studentIds: ["student-004", "student-003"],
  },
  {
    id: "lesson-005",
    title: "ポアント特別レッスン",
    date: shiftDate(base, 8),
    startTime: "19:00",
    endTime: "20:30",
    studio: "スタジオA",
    teacherId: "teacher-yuka",
    teacherName: "佐藤 由佳",
    level: "advanced",
    capacity: 6,
    studentIds: ["student-002", "student-001"],
  },
];

export const mockAttendance: Attendance[] = [
  {
    id: "lesson-001_student-001",
    lessonId: "lesson-001",
    lessonDate: shiftDate(base, -6),
    lessonTitle: "Jr.クラス（中級）",
    studentId: "student-001",
    studentName: "山田 さくら",
    status: "present",
    recordedBy: "佐藤 由佳",
  },
  {
    id: "lesson-001_student-005",
    lessonId: "lesson-001",
    lessonDate: shiftDate(base, -6),
    lessonTitle: "Jr.クラス（中級）",
    studentId: "student-005",
    studentName: "渡辺 かえで",
    status: "late",
    note: "学校行事のため15分遅刻",
    recordedBy: "佐藤 由佳",
  },
  {
    id: "lesson-002_student-003",
    lessonId: "lesson-002",
    lessonDate: shiftDate(base, -6),
    lessonTitle: "キッズクラス",
    studentId: "student-003",
    studentName: "高橋 めい",
    status: "present",
    recordedBy: "Emily Carter",
  },
  {
    id: "lesson-003_student-002",
    lessonId: "lesson-003",
    lessonDate: shiftDate(base, -3),
    lessonTitle: "アドバンスクラス",
    studentId: "student-002",
    studentName: "鈴木 ひかり",
    status: "present",
    recordedBy: "佐藤 由佳",
  },
  {
    id: "lesson-003_student-005",
    lessonId: "lesson-003",
    lessonDate: shiftDate(base, -3),
    lessonTitle: "アドバンスクラス",
    studentId: "student-005",
    studentName: "渡辺 かえで",
    status: "absent",
    note: "体調不良",
    recordedBy: "佐藤 由佳",
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: "announcement-001",
    title: "発表会のリハーサル日程について",
    body:
      "発表会リハーサルを下記日程で実施します。\n\n日時：翌週土曜日 13:00〜17:00\n場所：スタジオA\n持ち物：トウシューズ・レオタード・お水\n\n出演者は必ず出席してください。やむを得ず欠席の場合は講師までご連絡ください。",
    audience: "all",
    pinned: true,
    authorName: "佐藤 由佳",
    publishedOn: shiftDate(base, -2),
  },
  {
    id: "announcement-002",
    title: "月謝のお支払いについて（保護者の方へ）",
    body:
      "今月分の月謝のお支払い期限は月末日です。口座振替の登録がお済みでない方は、教室窓口までお申し出ください。",
    audience: "parents",
    pinned: false,
    authorName: "佐藤 由佳",
    publishedOn: shiftDate(base, -5),
  },
  {
    id: "announcement-003",
    title: "指導記録の入力期限（講師の方へ）",
    body:
      "各クラスの出欠入力はレッスン終了後24時間以内にお願いします。ミニアプリの「出欠管理」画面から登録できます。",
    audience: "teachers",
    pinned: false,
    authorName: "佐藤 由佳",
    publishedOn: shiftDate(base, -9),
  },
];

export const mockUsers: UserProfile[] = [
  {
    id: "admin-demo",
    uid: "admin-demo",
    displayName: "佐藤 由佳",
    role: "admin",
    email: "yuka@example.com",
  },
  {
    id: "teacher-demo",
    uid: "teacher-demo",
    displayName: "田中 華",
    role: "teacher",
    email: "hana@example.com",
  },
  {
    id: "parent-demo",
    uid: "parent-demo",
    displayName: "山田 みどり",
    role: "parent",
    studentIds: ["student-001", "student-002"],
  },
];
