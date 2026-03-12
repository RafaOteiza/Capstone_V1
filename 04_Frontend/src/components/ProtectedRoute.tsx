import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../app/token";
import { getCachedMe } from "../app/session";

export default function ProtectedRoute(props: { children: ReactNode; roles?: string[] }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  const me = getCachedMe();

  // Si se pide RBAC y ya existe /me cacheado, valida roles.
  if (props.roles && props.roles.length > 0 && me) {
    const ok = (me.roles ?? []).some((r) => props.roles!.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }

  return <>{props.children}</>;
}
