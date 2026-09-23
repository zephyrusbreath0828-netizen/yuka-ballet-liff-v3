import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./env";

/**
 * Firebase クライアント初期化（クライアント専用）。
 *
 * - `getApps().length` ガードにより、ホットリロードや複数回呼び出しでも多重初期化しない
 * - 遅延初期化（関数呼び出し時）にしているため、SSR / プリレンダー時に window へ触れない
 */

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase の環境変数（NEXT_PUBLIC_FIREBASE_*）が設定されていません。",
    );
  }
  cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  if (cachedDb) return cachedDb;
  const app = getFirebaseApp();
  try {
    cachedDb = initializeFirestore(app, {
      // LIFF / LINE 内ブラウザでも安定するよう long-polling を許可
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    cachedDb = getFirestore(app);
  }
  return cachedDb;
}
