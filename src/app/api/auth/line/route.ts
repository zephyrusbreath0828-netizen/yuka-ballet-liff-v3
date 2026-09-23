import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * LINE の ID トークンを検証し、Firebase のカスタムトークンを発行する Route Handler。
 *
 * 必要な環境変数（Vercel の Environment Variables に設定 / ソースには書かない）:
 *   LINE_LOGIN_CHANNEL_ID        … LINE ログイン（Web アプリ）チャネル ID
 *   FIREBASE_ADMIN_PROJECT_ID    … サービスアカウントの project_id
 *   FIREBASE_ADMIN_CLIENT_EMAIL  … サービスアカウントの client_email
 *   FIREBASE_ADMIN_PRIVATE_KEY   … サービスアカウントの private_key（\n を含む1行文字列）
 *
 * 未設定の場合は 501 を返し、クライアントは匿名ログインにフォールバックする。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LineVerifyResponse {
  sub?: string;
  name?: string;
  picture?: string;
  email?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    const idToken = body.idToken;
    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "idToken_required" },
        { status: 400 },
      );
    }

    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json(
        { ok: false, error: "line_channel_not_configured" },
        { status: 501 },
      );
    }

    // 1. LINE の ID トークン検証（client_secret は不要）
    const verifyResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
      cache: "no-store",
    });

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { ok: false, error: "line_verify_failed" },
        { status: 401 },
      );
    }

    const lineProfile = (await verifyResponse.json()) as LineVerifyResponse;
    if (!lineProfile.sub) {
      return NextResponse.json(
        { ok: false, error: "line_profile_invalid" },
        { status: 401 },
      );
    }

    // 2. Firebase Admin でカスタムトークンを発行
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { ok: false, error: "firebase_admin_not_configured" },
        { status: 501 },
      );
    }

    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
          });

    const customToken = await getAuth(app).createCustomToken(`line_${lineProfile.sub}`, {
      lineUserId: lineProfile.sub,
      displayName: lineProfile.name ?? "",
    });

    return NextResponse.json({
      ok: true,
      customToken,
      profile: {
        userId: lineProfile.sub,
        displayName: lineProfile.name ?? "",
        pictureUrl: lineProfile.picture ?? null,
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected_error",
        message: e instanceof Error ? e.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
