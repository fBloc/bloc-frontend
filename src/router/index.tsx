import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import pages from "./pages";
import { AuthorizedRoute } from "./helper";

export default function Router() {
  return (
    <BrowserRouter>
      <Switch>
        {pages.map(({ path, component, ...rest }) => (
          <AuthorizedRoute key={path} component={component} {...rest} path={path} />
        ))}
      </Switch>
    </BrowserRouter>
  );
}
