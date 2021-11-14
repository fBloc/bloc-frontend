import React, { lazy } from "react";
import SideNav from "@/components/SideNav";
import { BrowserRouter, Switch } from "react-router-dom";
import { AuthorizedRoute } from "@/router/helper";

const ArrangeList = lazy(() => import("@/views/arrangement/index2"));
const FlowList = lazy(() => import("@/views/flow/list"));

const RouterView = () => {
  return (
    <div className="flex items-start">
      <SideNav />
      <BrowserRouter>
        <Switch>
          <AuthorizedRoute component={FlowList} path="/flow" />
          <AuthorizedRoute component={ArrangeList} path="/arrangement" />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default RouterView;
