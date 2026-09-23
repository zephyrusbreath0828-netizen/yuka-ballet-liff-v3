import type { Liff } from "@line/liff";
import { LIFF_ID } from "./env";

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

let liffInstance: Liff | null = null;

/**
 * LIFF SDK を動的 import して初期化する。
 *
 * - `@line/liff` はブラウザ専用のため、必ずクライアントコンポーネントの
 *   副作用（useEffect）から呼び出すこと。動的 import により
 *   SSR / プリレンダー時に window 参照で落ちるのを防ぐ。
 */
export async function initLiff(): Promise<Liff> {
  if (typeof window === "undefined") {
    throw new Error("LIFF はクライアント環境でのみ初期化できます。");
  }
  if (!LIFF_ID) {
    throw new Error(
      "NEXT_PUBLIC_LIFF_ID が設定されていません。LINE Developers で LIFF ID を取得し、環境変数に設定してください。",
    );
  }
  if (liffInstance) return liffInstance;

  const mod = await import("@line/liff");
  const liff = (mod.default ?? mod) as unknown as Liff;
  await liff.init({ liffId: LIFF_ID });
  liffInstance = liff;
  return liffInstance;
}

/** 初期化済みインスタンスを返す（未初期化なら null） */
export function getLiff(): Liff | null {
  return liffInstance;
}

/** LIFF のログイン状態を確認し、必要ならログイン画面へリダイレクトする */
export async function ensureLiffLogin(): Promise<Liff | null> {
  const liff = await initLiff();
  if (!liff.isLoggedIn()) {
    liff.login();
    return null;
  }
  return liff;
}

export async function getLiffProfile(liff: Liff): Promise<LiffProfile> {
  const profile = await liff.getProfile();
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
    statusMessage: profile.statusMessage,
  };
}

export function isInLineBrowser(): boolean {
  return typeof window !== "undefined" && /Line\//i.test(navigator.userAgent);
}
