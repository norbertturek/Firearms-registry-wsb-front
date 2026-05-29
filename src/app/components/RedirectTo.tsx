import { Navigate, useLocation } from "react-router";

export function RedirectTo({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}
