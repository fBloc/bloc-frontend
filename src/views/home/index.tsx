import React, { useContext } from "react";
import { Button } from "@/components";
import { observer } from "mobx-react-lite";
import { AppStoreContext } from "@/store";
import Logo from "@/assets/images/logo.png";
import { NavLink } from "react-router-dom";
const Index = observer(() => {
  const appStore = useContext(AppStoreContext);

  return (
    <div className="h-screen flex items-center justify-center pb-96">
      <div className="text-center">
        <img src={Logo} alt="" className="w-40" />
        <p className="mb-20 text-2xl font-medium">BLOC</p>
        <NavLink to={appStore.isLogin ? "/arrangement" : "/login"}>
          <Button intent="primary">开始使用</Button>
        </NavLink>
      </div>
    </div>
  );
});

export default Index;
