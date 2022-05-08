import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { identificationInstance } from "@/shared/Identification ";

export const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();

  if (!identificationInstance.isValidLogin) {
    identificationInstance.removeToken();
    return <Navigate to="/login" state={{ from: location }} />;
  }
  return children;
};
