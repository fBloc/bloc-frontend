import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { showToast } from "@/components/toast";
import { isObject, mergeUrlQuery } from "./tools";
import { identificationInstance } from "./Identification";

export type ServerResponse<T> = {
  status_code: number;
  status_msg: string;
  data: T;
};

export function normalizeResponse<T>(
  data: T,
  conf: Partial<Pick<ResponseResult, "message" | "isValid">> = {},
): ResponseResult<T> {
  return {
    isValid: true,
    message: "",
    ...conf,
    data,
  };
}
const instance = axios.create({
  timeout: 60000,
  baseURL: window.bloc_app_env.BASE_URL,
});
instance.interceptors.request.use((request) => {
  const token = identificationInstance.token;

  if (!token && !request.url?.includes("/login")) {
    return Promise.reject(new Error("1011:未登录！"));
  }
  if (request.headers) {
    request.headers["token"] = token;
  }
  return request;
});
instance.interceptors.response.use((response) => {
  const { status, statusText, data } = response;
  if (status !== 200) {
    return Promise.reject(new Error(statusText));
  }
  if (data.status_code !== 200) {
    if (data.status_code === 401) {
      identificationInstance.removeToken();
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    return Promise.reject(new Error(data.status_msg));
  }
  return response;
});
export type ResponseResult<T = null> = {
  isValid: boolean;
  message: string;
  data: T | null;
};
class Request {
  request<T>(config: AxiosRequestConfig): Promise<ResponseResult<T | null>> {
    return instance
      .request<ServerResponse<T>>({
        ...config,
      } as any)
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

        showToast({
          children: message,
          autoHideDuration: 2000,
        });
        return {
          isValid: false,
          message,
          data: null,
        };
      });
  }
  get<T>(...[url, config]: Parameters<AxiosInstance["get"]>) {
    return this.request<T>({
      method: "GET",
      url: mergeUrlQuery(url, (isObject(config?.data) ? config?.data || {} : {}) as any),
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
  return Promise.resolve<ResponseResult>({
    isValid: false,
    message,
    data: null,
  });
}

export const isSingleArgumentValid = (...args: any[]) => {
  return args?.[0] !== "";
};
