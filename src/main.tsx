import React from "react";
import ReactDOM from "react-dom";
import Router from "./router/index";
import "./index.scss";
import { AppStore, AppStoreContext } from "./store";
import { Loading } from "@/components/Loading";
const store = new AppStore();

ReactDOM.render(
  <React.Suspense fallback={<Loading className="fixed" />}>
    <AppStoreContext.Provider value={store}>
      <Router />
    </AppStoreContext.Provider>
  </React.Suspense>,
  document.getElementById("root"),
);
