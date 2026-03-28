import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.auth.user);
  const initialized = useAppSelector((state) => state.auth.initialized);
  const location = useLocation();

  if (!initialized) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ redirectTo: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
}
