import React, { useContext, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useHistory, useLocation, Link } from "react-router-dom";
import { Button, Label, InputGroup, Checkbox } from "@/components";
import { AppStoreContext } from "@/store";
import { login } from "@/api";
import Logo from "@/assets/images/logo.png";
import { handleBooleanChange, handleStringChange } from "@/utils";

interface LocationState {
  from: {
    pathname: string;
  };
}
const Login = observer(() => {
  const history = useHistory();
  const location = useLocation();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberme, setRememberme] = useState(false);
  const appStore = useContext(AppStoreContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const clearError = useCallback(() => {
    setErrorMessage("");
  }, []);
  const onSubmit = useCallback(async () => {
    clearError();
    setLoading(true);
    const { data, isValid, message } = await login({ name, password });
    appStore.setToken({ token: data?.token || "", rememberme });
    setLoading(false);
    if (isValid && data) {
      history.replace((location.state as LocationState)?.from || { pathname: "/flow" });
    } else {
      if (message) {
        setErrorMessage(message);
      }
    }
    setLoading(false);
  }, [name, password, rememberme, appStore, history, location.state, clearError]);

  return (
    <div className="h-screen">
      <header className="p-6 flex items-center justify-between">
        <img src={Logo} alt="logo" className="w-12" />
        <p>
          <span className="mr-2 text-gray-400">第一次来到Bloc?</span>
          <Link to="/about" target="_blank">
            查看简介
          </Link>
        </p>
      </header>
      <main className="mt-8 mx-auto w-96">
        <p className="mb-10 text-3xl text-center">登录</p>
        <Label>
          <InputGroup
            placeholder="账号"
            value={name}
            onInput={clearError}
            onChange={handleStringChange(setName)}
            large={true}
          />
        </Label>
        <Label className="mt-10">
          <InputGroup
            type="password"
            placeholder="密码"
            onInput={clearError}
            maxLength={20}
            onChange={handleStringChange(setPassword)}
            large={true}
          />
        </Label>
        <div className="flex items-center justify-between">
          <Checkbox checked={rememberme} label="记住登录状态" onChange={handleBooleanChange(setRememberme)} />
          <p className="text-xs text-red-500">{errorMessage}</p>
        </div>

        <Button
          color="primary"
          onClick={onSubmit}
          className="mt-5 w-full"
          large={true}
          loading={loading}
          disabled={!name || !password}
        >
          登录
        </Button>
      </main>
    </div>
  );
});

export default Login;
