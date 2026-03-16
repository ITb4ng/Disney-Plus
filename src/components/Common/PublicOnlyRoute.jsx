import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function PublicOnlyRoute() {
  const { userData, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  const isAuthenticated = !!userData;
  const loginState = location.state;

  if (isAuthenticated) {
    if (
      loginState?.intent === "detail" &&
      loginState?.detailId &&
      loginState?.detailType
    ) {
      return (
        <Navigate
          to={`/detail/${loginState.detailType}/${loginState.detailId}`}
          replace
          state={{
            from: loginState.from || "/",
            teaserSource: loginState.teaserSource,
            preloadedTitle: loginState.detailTitle,
            preloadedBackdrop: loginState.detailBackdrop,
            preloadedPoster: loginState.detailPoster,
            scrollY: typeof loginState.scrollY === "number" ? loginState.scrollY : 0,
            detailDebugState: loginState.detailDebugState,
          }}
        />
      );
    }

    return <Navigate to="/main" replace />;
  }

  return <Outlet />;
}
