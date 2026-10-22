import type { NativeSession } from "@darkview/contracts";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";

import { platform } from "./api";
import { failureOf, isCurrent, type SignInFailure } from "./session-rules";

export type { SignInFailure };

// ADR-061: the native session's token lives in the platform keychain, never in plain
// storage. The web build (used only to check the app in a browser) keeps it in memory.
const key = "stellar.session";

const vault = {
  read: async () => (Platform.OS === "web" ? null : SecureStore.getItemAsync(key)),
  write: async (value: string) => {
    if (Platform.OS !== "web") await SecureStore.setItemAsync(key, value);
  },
  clear: async () => {
    if (Platform.OS !== "web") await SecureStore.deleteItemAsync(key);
  },
};

type SessionState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; session: NativeSession };

const SessionContext = createContext<{
  state: SessionState;
  signIn: (email: string, password: string) => Promise<SignInFailure | null>;
  signOut: () => Promise<void>;
  /** A read answered 401: the session is gone, so forget it. */
  expired: () => Promise<void>;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    vault
      .read()
      .then((stored) => {
        const session = stored ? (JSON.parse(stored) as NativeSession) : null;
        setState(session && isCurrent(session) ? { status: "signed-in", session } : { status: "signed-out" });
      })
      .catch(() => setState({ status: "signed-out" }));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const session = await platform.signIn({ email, password });
      await vault.write(JSON.stringify(session));
      setState({ status: "signed-in", session });
      return null;
    } catch (error) {
      return failureOf(error);
    }
  }, []);

  const forget = useCallback(async () => {
    await vault.clear();
    setState({ status: "signed-out" });
  }, []);

  const signOut = useCallback(async () => {
    if (state.status === "signed-in") {
      // The platform deletes the row; if it cannot be reached, the token is still
      // dropped here, and lapses on its own.
      await platform.signOut(state.session.token).catch(() => undefined);
    }
    await forget();
  }, [state, forget]);

  const value = useMemo(() => ({ state, signIn, signOut, expired: forget }), [state, signIn, signOut, forget]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession outside SessionProvider");
  return value;
}
