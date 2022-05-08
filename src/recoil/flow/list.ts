import { FlowListType } from "@/shared/enums";
import { atom } from "recoil";

export const flowListTab = atom({
  key: "flowListTab",
  default: FlowListType.launched,
});
