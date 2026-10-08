import liff from "@line/liff";

/**
 * LIFF SDK の初期化。
 * クライアントサイドでのみ呼び出すこと（Next.js の SSR では動作しない）。
 */
export async function initLiff(): Promise<void> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) {
    throw new Error(
      "LIFF ID が設定されていません。.env.local の NEXT_PUBLIC_LIFF_ID を確認してください。"
    );
  }
  await liff.init({ liffId });
}

export function isLiffLoggedIn(): boolean {
  return liff.isLoggedIn();
}

export function liffLogin(): void {
  liff.login();
}

export function liffLogout(): void {
  liff.logout();
}

/** LINE プロフィール取得（userId / displayName / pictureUrl） */
export async function getLiffProfile(): Promise<{
  userId: string;
  displayName: string;
  pictureUrl: string | null;
}> {
  const profile = await liff.getProfile();
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl ?? null,
  };
}

/** QR スキャン（LINE 内ブラウザのみ対応） */
export async function scanQrCode(): Promise<string | null> {
  if (!liff.isInClient()) {
    throw new Error("QR読み取りはLINEアプリ内でのみ利用できます");
  }
  try {
    if (typeof liff.scanCode !== "function") {
      throw new Error("このLIFFバージョンではQRスキャンを利用できません");
    }
    const result = await liff.scanCode();
    return result?.value ?? null;
  } catch {
    return null;
  }
}

/** LINE公式アカウントとのトーク画面を開く */
export function openLineTalk(): void {
  liff.openWindow({
    url: "https://line.me/R/tip?p=@yuka-ballet",
    external: false,
  });
}

export default liff;
