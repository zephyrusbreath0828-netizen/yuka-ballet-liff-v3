"use client";

import { createContext, useContext } from "react";
import type { AppUser } from "./types";

export type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
};

/**
 * 認証コンテキスト（唯一の定義）。
 * UserProvider（src/lib/user-provider.tsx）がこのオブジェクトを Provide し、
 * useUser() が同じオブジェクトを参照する。二重定義はしない。
 */
export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
});

export function useUser(): AuthContextValue {
  return useContext(AuthContext);
}
