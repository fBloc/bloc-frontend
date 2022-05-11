import React, { useMemo } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { auth } from "@/recoil/app/auth";
import { PAGES } from "./pages";

import { useRecoilState } from "recoil";
import { getUserInfo } from "../api/auth";

import { useQuery } from "react-query";
import { identificationInstance } from "../shared/Identification";
import { Loading } from "@/components";

export function AuthRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const [userInfo, setUserInfo] = useRecoilState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, data } = useQuery({
    queryKey: "getUserInfo",
    queryFn: getUserInfo,
    enabled: !userInfo && identificationInstance.token !== "",
    onSuccess: ({ data, isValid }) => {
      if (!isValid) {
        identificationInstance.removeToken();
        navigate(PAGES.login);
      }
      setUserInfo(data);
    },
  });
  const _userInfo = useMemo(() => data?.data ?? null, [data]);
  const hasAccess = useMemo(() => {
    if (!roles || roles.length === 0) return _userInfo !== null;
    return roles.some((role) => _userInfo?.roles.includes(role));
  }, [roles, _userInfo]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  if (!hasAccess) {
    return <Navigate to={PAGES.login} state={{ from: location }} />;
  }
  return <>{children}</>;
}
