import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import type { AuthSession } from "@/types";

type ProtectedRouteProps = {
  allowedRole: AuthSession["role"];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return (
      <Navigate
        to={allowedRole === "buyer" ? "/buyer/login" : "/shopkeeper/login"}
        replace
        state={{ from: location }}
      />
    );
  }

  if (session.role !== allowedRole) {
    return <Navigate to={session.role === "buyer" ? "/buyer" : "/shopkeeper/dashboard"} replace />;
  }

  return <>{children}</>;
}
