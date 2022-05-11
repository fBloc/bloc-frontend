import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthRoute } from "./auth";
import Empty from "@/components/empty";
import { ErrorBoundary } from "@/components";
import Root, { SuspenseFallback } from "@/components/Root";
const FlowList = React.lazy(() => import("@/pages/flow/list"));
const About = React.lazy(() => import("@/pages/about"));
const NotFound = React.lazy(() => import("@/pages/notFound"));
const Login = React.lazy(() => import("@/pages/login"));
const Result = React.lazy(() => import("@/pages/result"));
const EmptyResult = React.lazy(() => import("@/pages/result/empty"));
const FlowDraft = React.lazy(() => import("@/pages/flow/draft"));
const ViewFlow = React.lazy(() => import("@/pages/flow/history"));
const FlowDetail = React.lazy(() => import("@/pages/flow/detail"));
const Functions = React.lazy(() => import("@/pages/functions"));
const Home = React.lazy(() => import("@/pages/home"));
const Admin = React.lazy(() => import("@/pages/admin"));

const RouterView = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ErrorBoundary hasError={false}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Root />}>
              <Route index element={<Home />}></Route>
              <Route path="flow">
                <Route
                  index
                  element={
                    <AuthRoute>
                      <FlowList />
                    </AuthRoute>
                  }
                />
                <Route path="detail">
                  <Route
                    index
                    element={
                      <AuthRoute>
                        <Empty />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path=":originId"
                    element={
                      <AuthRoute>
                        <FlowDetail />
                      </AuthRoute>
                    }
                  />
                </Route>
                <Route path="draft">
                  <Route
                    index
                    element={
                      <AuthRoute>
                        <Empty />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path=":originId"
                    element={
                      <AuthRoute>
                        <FlowDraft />
                      </AuthRoute>
                    }
                  />
                </Route>
                <Route path="history">
                  <Route
                    index
                    element={
                      <AuthRoute>
                        <Empty />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path=":versionId"
                    element={
                      <AuthRoute>
                        <ViewFlow />
                      </AuthRoute>
                    }
                  />
                </Route>
              </Route>
              <Route path="result">
                <Route
                  index
                  element={
                    <AuthRoute>
                      <EmptyResult />
                    </AuthRoute>
                  }
                />
                <Route path=":key" element={<Result />} />
              </Route>
              <Route
                path="functions"
                element={
                  <AuthRoute>
                    <Functions />
                  </AuthRoute>
                }
              />
              <Route
                path="about"
                element={
                  <AuthRoute>
                    <About />
                  </AuthRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <AuthRoute roles={["admin"]}>
                    <Admin />
                  </AuthRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </Suspense>
  );
};

export default RouterView;
