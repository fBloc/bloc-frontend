import React, { useCallback, useContext } from "react";
import { Route, Redirect, RouteProps, RouteChildrenProps } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { PageItem } from "./pages";
import { AppStoreContext } from "@/store";

interface IAuthorized {
  authority?: string[];
  userAuthority: string;
  fallback: React.ReactElement;
}
const Authorized: React.FC<IAuthorized> = React.memo(({ authority, fallback, userAuthority, children }) => {
  if (!authority) return <>{children}</>;
  if (authority.includes(userAuthority)) return <>{children}</>;
  return fallback;
});

type IPageProps = Pick<PageItem, "redirect" | "authority" | "component" | "public">;
export const AuthorizedRoute: React.FC<RouteProps & IPageProps> = observer((props) => {
  const appStore = useContext(AppStoreContext);
  const { redirect, authority, component, public: isPublic, ...rest } = props;
  const RedirectToLogin = useCallback(
    (location: RouteChildrenProps["location"]) => {
      return (
        <Redirect
          to={{
            pathname: redirect || "/",
            state: {
              from: location,
            },
          }}
        />
      );
    },
    [redirect],
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (!appStore.token && !isPublic) return RedirectToLogin(rest.location!);
  return (
    <Authorized
      userAuthority="admin"
      authority={authority}
      fallback={
        <Route
          {...rest}
          render={({ location }) => {
            return RedirectToLogin(location);
          }}
        />
      }
    >
      <Route component={component} {...rest} />
    </Authorized>
  );
});
