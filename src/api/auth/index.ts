import request, { interceptRequest, ResponseResult } from "@/shared/request";
export interface LoginUserInfo {
  id: string;
  name: string;
  token: string;
  create_time: number;
  super_user: boolean;
}
export type OriginUserInfo = Pick<LoginUserInfo, "name" | "create_time"> & {
  super: boolean;
  is_admin: boolean;
};

export type UserInfo = {
  name: string;
  createTime: number;
  roles: string[];
};
interface LoginForm {
  name: string;
  password: string;
}

export const login = (user: LoginForm) => {
  return request.post<LoginUserInfo>("/api/v1/login", user);
};

export const getUserInfo = (): Promise<ResponseResult<UserInfo>> => {
  return request.get<OriginUserInfo>("/api/v1/user/info").then((res) => ({
    ...res,
    data: res.data
      ? {
          name: res.data.name,
          createTime: res.data.create_time,
          roles: [...(res.data.is_admin ? ["admin"] : []), ...(res.data.super ? ["super"] : [])],
        }
      : null,
  }));
};
