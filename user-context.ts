"use client";

import { createContext, useContext } from "react";
import type { AppUser } from "./types";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function useUser(): AuthContextValue {
  return useContext(AuthContext);
}
