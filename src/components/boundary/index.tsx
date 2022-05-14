import React from "react";
import { Button } from "@mui/material";
import loadingIcon from "./loading.svg";
import i18n from "@/i18n";
class ErrorBoundary extends React.Component<{ hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }
  componentDidCatch() {
    // 你同样可以将错误日志上报给服务器
  }
  render() {
    if ((this.state as any).hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div className="h-screen flex justify-center items-center pb-40">
          <div className="text-center">
            <img className="w-96" src={loadingIcon} alt="" />

            <p className="font-mono text-2xl">{i18n.t("unknownError")}</p>
            <div
              className="mt-6"
              onClick={() => {
                window.location.href = `${import.meta.env.BASE_URL}flow`;
              }}
            >
              <Button variant="outlined">{i18n.t("toHomePage")}</Button>
              <Button
                sx={{
                  ml: 2,
                }}
                color="primary"
                variant="contained"
                onClick={() => {
                  window.location.reload();
                }}
              >
                {i18n.t("reloadPage")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
