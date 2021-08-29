import React, { lazy } from "react";
import Home from "@/views/home";

const Login = lazy(() => import("@/views/login"));
const About = lazy(() => import("@/views/about"));
const ArrangementItem = lazy(() => import("@/views/arrangement/list"));
const FlowItem = lazy(() => import("@/views/flow/item"));
const V = lazy(() => import("@/views/home/RouterView"));

export const PAGES = {
  about: "/about",
  login: "/login",
  flowList: "/flow",
  flowItem: "/flow/:id",
  arrangementList: "/arrangement",
  arrangementItem: "/arrangement/:id",
};

export interface PageItem {
  exact?: boolean;
  path: string;
  component: React.ComponentType;
  redirect?: string;
  authority?: string[];
  public?: boolean;
}
const pages: PageItem[] = [
  {
    path: PAGES.about,
    component: About,
  },
  {
    path: PAGES.login,
    component: Login,
    public: true,
  },
  {
    path: PAGES.flowItem,
    component: FlowItem,
    exact: true,
  },
  {
    path: PAGES.arrangementItem,
    component: ArrangementItem,
    exact: true,
  },
  {
    path: "/flow",
    component: V,
  },
  {
    path: "/arrangement",
    component: V,
  },
  {
    path: "/",
    exact: true,
    component: Home,
    public: true,
  },
];
export default pages;
