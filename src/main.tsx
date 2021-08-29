import React from "react";
import ReactDOM from "react-dom";
import Router from "./router/index";
import "./index.scss";
import { AppStore, AppStoreContext } from "./store";
const store = new AppStore();

ReactDOM.render(
  <React.Suspense fallback={<></>}>
    <AppStoreContext.Provider value={store}>
      <Router />
    </AppStoreContext.Provider>
  </React.Suspense>,
  document.getElementById("root"),
);
