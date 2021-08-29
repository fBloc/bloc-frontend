import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Nullable } from "@/common";
// import { SnackbarPlugin } from "components/Snackbar";
import { login } from "@/store";
import { ToastPlugin } from "@/components/plugins";

export type ServerResponse<T> = {
  status_code: number;
  status_msg: string;
  data: T;
};

const instance = axios.create({
  timeout: 60000,
});
instance.interceptors.request.use((request) => {
  const token = login.token;
  if (!token && !request.url?.includes("/login")) {
    return Promise.reject(new Error("1011:未登录！"));
  }
  request.headers["token"] = login.token;
  return request;
});
instance.interceptors.response.use((response) => {
  const { status, statusText, data } = response;
  if (status !== 200) {
    return Promise.reject(new Error(statusText));
  }
  if (data.status_code !== 200) {
    if (data.status_code === 401) {
      login.removeToken();
    }
    return Promise.reject(new Error(data.status_msg));
  }
  return response;
});
export type IAppResponse<T = null> = {
  isValid: boolean;
  message: string;
  data: T;
};
class Request {
  private lastConfig = "";
  private isSameParams(config: AxiosRequestConfig) {
    return JSON.stringify(config) === this.lastConfig;
  }
  request<T>(config: AxiosRequestConfig): Promise<IAppResponse<Nullable<T>>> {
    this.lastConfig = JSON.stringify(config);
    return instance
      .request<ServerResponse<T>>(config)
      .then((res) => {
        const { status_code, data, status_msg } = res.data;
        return {
          isValid: status_code >= 200 && status_code < 300,
          message: status_msg,
          data,
        };
      })
      .catch((error) => {
        const message = error.isAxiosError ? "网络错误，请重试。" : error.message;
        this.lastConfig = "";
        ToastPlugin.error({
          message,
        });
        return {
          isValid: false,
          message,
          data: null,
        };
      });
  }
  get<T>(...params: Parameters<AxiosInstance["get"]>) {
    const [url, config] = params;
    return this.request<T>({
      method: "GET",
      url,
      ...config,
    });
  }
  post<T>(...params: Parameters<AxiosInstance["post"]>) {
    const [url, data, config] = params;
    return this.request<T>({
      method: "post",
      url,
      data,
      ...config,
    });
  }
  delete<T>(...params: Parameters<AxiosInstance["delete"]>) {
    const [url, config] = params;
    return this.request<T>({
      method: "delete",
      url,
      ...config,
    });
  }
  patch<T>(...params: Parameters<AxiosInstance["patch"]>) {
    const [url, data, config] = params;
    return this.request<T>({
      method: "patch",
      url,
      data,
      ...config,
    });
  }
}
export default new Request();

export function interceptRequest({ message }: { message: string }) {
  return Promise.resolve<IAppResponse>({
    isValid: false,
    message,
    data: null,
  });
}
