/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { AuthSession, BuyerSession, ShopkeeperSession } from "@/types";

const SESSION_STORAGE_KEY = "localmarket.session";

type AuthContextValue = {
  session: AuthSession | null;
  buyerSession: BuyerSession | null;
  shopkeeperSession: ShopkeeperSession | null;
  loginBuyer: (session: BuyerSession) => void;
  loginShopkeeper: (session: ShopkeeperSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function isBuyerSession(value: unknown): value is BuyerSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<BuyerSession>;
  return (
    session.role === "buyer" &&
    typeof session.name === "string" &&
    typeof session.email === "string"
  );
}

function isShopkeeperSession(value: unknown): value is ShopkeeperSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<ShopkeeperSession>;
  return (
    session.role === "shopkeeper" &&
    typeof session.id === "string" &&
    typeof session.ownerName === "string" &&
    typeof session.email === "string" &&
    typeof session.shopName === "string" &&
    typeof session.shopLocation === "string" &&
    (typeof session.latitude === "number" || session.latitude === null) &&
    (typeof session.longitude === "number" || session.longitude === null)
  );
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error(error);
  }
}

function readStoredSession(): AuthSession | null {
  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed: unknown = JSON.parse(stored);
    if (isBuyerSession(parsed) || isShopkeeperSession(parsed)) {
      return parsed;
    }

    clearStoredSession();
    return null;
  } catch (error) {
    console.error(error);
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);

  function persistSession(nextSession: AuthSession | null) {
    setSession(nextSession);

    try {
      if (nextSession) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
        return;
      }

      clearStoredSession();
    } catch (error) {
      console.error(error);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      buyerSession: session?.role === "buyer" ? session : null,
      shopkeeperSession: session?.role === "shopkeeper" ? session : null,
      loginBuyer: (nextSession) => persistSession(nextSession),
      loginShopkeeper: (nextSession) => persistSession(nextSession),
      logout: () => persistSession(null),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function getDefaultPortalPath(session: AuthSession | null): string {
  if (!session) {
    return "/";
  }

  return session.role === "buyer" ? "/buyer" : "/shopkeeper/dashboard";
}
