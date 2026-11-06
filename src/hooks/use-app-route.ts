import { useLocation, useNavigate } from "react-router";

export function useAppRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname === "/" ? "/dashboard" : location.pathname;
  return {
    path,
    segments: path.split("/").filter(Boolean),
    query: new URLSearchParams(location.search),
    navigate,
  };
}
