/**
 * 環境変数アクセス層。
 *
 * NEXT_PUBLIC_* は Next.js がビルド時にリテラル参照をインライン化するため、
 * 必ず `process.env.NEXT_PUBLIC_XXX` の形で直接参照すること（動的キー参照は不可）。
 *
 * 機密値（サービスアカウント等）はソースコードに書かず、
 * Vercel の Environment Variables（または .env.local）から読み込む。
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** LIFF ID（LINE ミニアプリ / LIFF チャネル） */
export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

/** 必須の Firebase 環境変数が揃っているか */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
  );
}

/** 未設定の Firebase 環境変数キー一覧（セットアップ画面の表示用） */
export function missingFirebaseKeys(): string[] {
  const required: Array<[string, string]> = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
    ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
    ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", firebaseConfig.appId],
    ["NEXT_PUBLIC_LIFF_ID", LIFF_ID],
  ];
  return required.filter(([, value]) => !value).map(([key]) => key);
}
