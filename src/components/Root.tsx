import { PAGES } from "@/router/pages";
import React, { Suspense } from "react";
import { Outlet, useMatch } from "react-router-dom";
import Loading from "./loading";
import SideNav from "./SideNav";

export const SuspenseFallback = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Loading />
    </div>
  );
};
const Root = () => {
  const matchedRoute = useMatch("/*");

  return (
    <div className="flex">
      {[PAGES.flowList, PAGES.functions, PAGES.admin].includes(matchedRoute?.pathname || "") && <SideNav />}
      <div className="flex-grow">
        <Suspense fallback={<SuspenseFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};
export default Root;
