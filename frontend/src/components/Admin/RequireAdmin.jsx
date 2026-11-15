import React from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "../../context/AdminContext";

export default function RequireAdmin({ children }) {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Checking permissions...</div>;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}