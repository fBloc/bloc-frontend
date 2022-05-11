/**
 * 鉴权相关
 */

import { UserInfo } from "@/api/auth";
import { atom } from "recoil";

export const auth = atom<UserInfo | null>({
  key: "app/auth",
  default: null, // TODO  删除
});
