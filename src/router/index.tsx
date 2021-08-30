import React, { createContext, useMemo } from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import pages from "./pages";
import { AuthorizedRoute } from "./helper";
import { makeObservable, observable, action } from "mobx";
import { observer } from "mobx-react-lite";
class Reload {
  @observable key = 0;
  constructor() {
    makeObservable(this);
  }
  @action setKey() {
    this.key += 1;
  }
}

export const RouterContext = createContext({} as Reload);
const RouterView = () => {
  const value = useMemo(() => new Reload(), []);
  return (
    <RouterContext.Provider value={value}>
      <Router key={value.key}>
        <Switch>
          {pages.map(({ path, component, ...rest }) => (
            <AuthorizedRoute key={path} component={component} {...rest} path={path} />
          ))}
        </Switch>
      </Router>
    </RouterContext.Provider>
  );
};

export default observer(RouterView);
