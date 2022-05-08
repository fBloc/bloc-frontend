import request, { interceptRequest } from "@/shared/request";
export interface UserInfo {
  id: string;
  name: string;
  token: string;
  create_time: string;
  super_user: boolean;
}

interface LoginForm {
  name: string;
  password: string;
}

export const login = (user: LoginForm) => {
  if (!user.name || !user.password) return interceptRequest({ message: "账号或密码不能为空。" });
  return request.post<UserInfo>("/api/v1/login", user);
};
