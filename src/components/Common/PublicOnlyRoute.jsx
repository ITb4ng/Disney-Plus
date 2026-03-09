import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function PublicOnlyRoute() {
  const { userData, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  const isAuthenticated = !!userData;

  if (isAuthenticated) {
    return <Navigate to="/main" replace />;
  }

  return <Outlet />;
}