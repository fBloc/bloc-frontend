/**
 * 鉴权相关
 */

import { identificationInstance } from "@/shared/Identification ";
import { atom } from "recoil";

export const identification = atom({
  key: "identification",
  default: {}, // TODO  删除
});
