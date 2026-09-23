"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { isFirebaseConfigured, LIFF_ID } from "./env";
import { ensureLiffLogin, getLiffProfile, type LiffProfile } from "./liff";
import { fetchUserProfile, upsertUserProfile } from "./repository";
import type { Role, UserProfile } from "./types";

export type AuthMode = "initializing" | "line" | "anonymous" | "demo" | "error";

interface AuthContextValue {
  ready: boolean;
  mode: AuthMode;
  role: Role;
  profile: UserProfile | null;
  lineProfile: LiffProfile | null;
  demoMode: boolean;
  error: string | null;
  notice: string | null;
  signInWithLine: () => Promise<void>;
  setDemoRole: (role: Role) => void;
  signOutUser: () => Promise<void>;
}

const DEMO_MODE = !isFirebaseConfigured();
const DEMO_ROLE_KEY = "yuka-ballet:demo-role";

const DEMO_NOTICE =
  "Firebase の環境変数が未設定のためデモモードで動作しています。データはブラウザ内のみに保持され、リロードでリセットされます。";

const AuthContext = createContext<AuthContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* デモ用ロール（外部ストアとして useSyncExternalStore で購読）      */
/* ------------------------------------------------------------------ */
const demoRoleListeners = new Set<() => void>();

function subscribeDemoRole(callback: () => void): () => void {
  demoRoleListeners.add(callback);
  const onStorage = () => callback();
  window.addEventListener("storage", onStorage);
  return () => {
    demoRoleListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function isRole(value: string | null): value is Role {
  return value === "admin" || value === "teacher" || value === "parent";
}

function getDemoRoleSnapshot(): Role {
  const stored = window.localStorage.getItem(DEMO_ROLE_KEY);
  return isRole(stored) ? stored : "admin";
}

function getDemoRoleServerSnapshot(): Role {
  return "admin";
}

function writeDemoRole(next: Role): void {
  window.localStorage.setItem(DEMO_ROLE_KEY, next);
  demoRoleListeners.forEach((listener) => listener());
}

/* ------------------------------------------------------------------ */
/* Firebase 認証状態                                                   */
/* ------------------------------------------------------------------ */
interface FirebaseAuthState {
  ready: boolean;
  mode: Exclude<AuthMode, "demo">;
  profile: UserProfile | null;
  role: Role;
}

const INITIAL_FIREBASE_STATE: FirebaseAuthState = {
  ready: false,
  mode: "initializing",
  profile: null,
  role: "parent",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Firebase 未設定でも呼び出し順序を一定に保つため、常に購読フックを呼ぶ
  const demoRole = useSyncExternalStore(
    subscribeDemoRole,
    getDemoRoleSnapshot,
    getDemoRoleServerSnapshot,
  );
  const [firebaseState, setFirebaseState] =
    useState<FirebaseAuthState>(INITIAL_FIREBASE_STATE);
  const [lineProfile, setLineProfile] = useState<LiffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const startedRef = useRef(false);

  /* ---------------- Firebase Auth の購読（外部システムの同期） ---------------- */
  useEffect(() => {
    if (DEMO_MODE) return;
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setFirebaseState({ ready: true, mode: "anonymous", profile: null, role: "parent" });
        return;
      }
      void (async () => {
        try {
          const existing = await fetchUserProfile(user.uid);
          const resolved =
            existing ??
            (await upsertUserProfile({
              uid: user.uid,
              displayName: user.displayName ?? "ゲスト",
              role: "parent",
            }));
          setFirebaseState({
            ready: true,
            mode: "line",
            profile: resolved,
            role: resolved.role,
          });
        } catch (e) {
          setError(
            e instanceof Error
              ? `利用者プロフィールの取得に失敗しました: ${e.message}`
              : "利用者プロフィールの取得に失敗しました。",
          );
          setFirebaseState((prev) => ({ ...prev, ready: true, mode: "error" }));
        }
      })();
    });
    return () => unsubscribe();
  }, []);

  /* ---------------- LIFF ログイン → Firebase カスタムトークン ---------------- */
  const signInWithLine = useCallback(async () => {
    if (DEMO_MODE) return;
    setError(null);
    try {
      const liff = await ensureLiffLogin();
      if (!liff) return; // liff.login() によりリダイレクト中
      const idToken = liff.getIDToken();
      const publicProfile = await getLiffProfile(liff);
      setLineProfile(publicProfile);

      if (!idToken) {
        throw new Error("LINE の ID トークンを取得できませんでした。");
      }

      const res = await fetch("/api/auth/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        customToken?: string;
        error?: string;
      };

      if (res.ok && data.ok && data.customToken) {
        await signInWithCustomToken(getFirebaseAuth(), data.customToken);
        setNotice(null);
        return;
      }

      // サーバー側の LINE 検証 or サービスアカウント未設定 → 匿名ログインで継続
      await signInAnonymously(getFirebaseAuth());
      const uid = getFirebaseAuth().currentUser?.uid ?? "anonymous";
      const merged = await upsertUserProfile({
        uid,
        displayName: publicProfile.displayName,
        lineUserId: publicProfile.userId,
        pictureUrl: publicProfile.pictureUrl,
        role: "parent",
      });
      setFirebaseState({
        ready: true,
        mode: "anonymous",
        profile: merged,
        role: merged.role,
      });
      setNotice(
        "LINE の ID トークン検証サーバーが未設定のため、匿名ログインで起動しました。README の手順で FIREBASE_ADMIN_* と LINE_LOGIN_CHANNEL_ID を設定すると本人確認付きログインになります。",
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "ログインに失敗しました。";
      setError(message);
      setFirebaseState((prev) => ({ ...prev, ready: true, mode: "error" }));
      // 匿名ログインにフォールバック（匿名プロバイダが有効な場合のみ成功）
      try {
        await signInAnonymously(getFirebaseAuth());
        setFirebaseState((prev) => ({ ...prev, mode: "anonymous" }));
      } catch {
        /* 匿名も無効な場合はエラー表示のまま */
      }
    }
  }, []);

  /* ---------------- 起動時のブートストラップ ---------------- */
  useEffect(() => {
    if (DEMO_MODE) return;
    if (startedRef.current) return;
    startedRef.current = true;
    void (async () => {
      if (!LIFF_ID) {
        setNotice("NEXT_PUBLIC_LIFF_ID が未設定のため、LIFF ログインをスキップしました。");
        try {
          await signInAnonymously(getFirebaseAuth());
          setFirebaseState((prev) => ({ ...prev, ready: true, mode: "anonymous" }));
        } catch {
          setFirebaseState((prev) => ({ ...prev, ready: true, mode: "error" }));
          setError(
            "LINE ログインを開始できませんでした。環境変数と Firebase Authentication の設定を確認してください。",
          );
        }
        return;
      }
      await signInWithLine();
    })();
  }, [signInWithLine]);

  const setDemoRole = useCallback((next: Role) => {
    writeDemoRole(next);
  }, []);

  const signOutUser = useCallback(async () => {
    if (DEMO_MODE) return;
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    if (DEMO_MODE) {
      return {
        ready: true,
        mode: "demo",
        role: demoRole,
        profile: null,
        lineProfile: null,
        demoMode: true,
        error: null,
        notice: DEMO_NOTICE,
        signInWithLine,
        setDemoRole,
        signOutUser,
      };
    }
    return {
      ready: firebaseState.ready,
      mode: firebaseState.mode,
      role: firebaseState.role,
      profile: firebaseState.profile,
      lineProfile,
      demoMode: false,
      error,
      notice,
      signInWithLine,
      setDemoRole,
      signOutUser,
    };
  }, [
    demoRole,
    firebaseState,
    lineProfile,
    error,
    notice,
    signInWithLine,
    setDemoRole,
    signOutUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth は AuthProvider の内部でのみ使用できます。");
  }
  return context;
}
