import React from "react";
import Button from "../button";
import loadi from "./loading.svg";
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
            <img className="w-96" src={loadi} alt="" />

            <p className="font-mono text-2xl">ops！出现了一个未知错误</p>
            <div
              className="mt-6"
              onClick={() => {
                window.location.href = `${import.meta.env.BASE_URL}flow`;
              }}
            >
              <Button variant="plain">回到首页</Button>
              <Button
                className="ml-4"
                intent="primary"
                onClick={() => {
                  window.location.reload();
                }}
              >
                刷新页面
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
