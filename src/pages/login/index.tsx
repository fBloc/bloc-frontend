import React, { useCallback, useState } from "react";
import { handleStringChange } from "@/shared/form";
import { Input, Button } from "@/components";

import { useLocation, Link, useNavigate, Navigate } from "react-router-dom";
import { login } from "@/api/auth";
import Logo from "@/assets/logo.png";
import LogoWithName from "@/assets/logo-name.png";
import { identificationInstance } from "@/shared/Identification ";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const clearError = useCallback(() => {
    setErrorMessage("");
  }, []);

  const onSubmit = useCallback(async () => {
    clearError();
    setLoading(true);
    const { data, isValid, message } = await login({ name, password });

    setLoading(false);
    if (isValid && data) {
      identificationInstance.saveToken(data.token);
      navigate(from || "/flow", { replace: true });
    } else {
      if (message) {
        setErrorMessage(message);
      }
      setLoading(false);
    }
  }, [name, password, clearError, navigate, from]);

  if (identificationInstance.isValidLogin) {
    return <Navigate to="/flow" replace />;
  }

  return (
    <div className="h-screen flex flex-col items-center bg-gray-50">
      <header className="p-6 flex items-center justify-between w-full">
        <img src={Logo} alt="logo" className="w-12" />
        <p>
          <span className="mr-2 text-gray-400">第一次来到Bloc?</span>
          <Link to="/about" target="_blank">
            查看简介
          </Link>
        </p>
      </header>
      <form
        className="bg-white p-6 rounded-lg shadow w-96"
        action=""
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="mb-10 text-3xl text-center">
          <img src={LogoWithName} alt="logo" className="h-10 mx-auto" />
          <p className="text-sm mt-2 text-gray-400 font-mono">you agree to the storing of cookies on your device</p>
        </div>
        <Input
          block
          placeholder="账号"
          value={name}
          onInput={clearError}
          autoComplete="username"
          onChange={handleStringChange(setName)}
        />

        <Input
          className="mt-4"
          type="password"
          placeholder="密码"
          block
          onInput={clearError}
          maxLength={20}
          autoComplete="current-password"
          onChange={handleStringChange(setPassword)}
        />
        {errorMessage && <p className="text-red-400">{errorMessage}</p>}
        <Button onClick={onSubmit} className="mt-4" block intent="primary" disabled={!name || !password}>
          登录
        </Button>
      </form>
    </div>
  );
};
export default Login;
