import { atom, selector } from "recoil";
import { FunctionGroup, getFunctions } from "@/api/functions";
import { flatFunctions } from "@/processors";

/**
 * function list
 */
export const functionGroupState = atom<FunctionGroup[]>({
  key: "functions",
  default: getFunctions().then((res) => res.data),
});

/**
 * flat function list
 */
export const flatFunctionState = selector({
  key: "flatFunctions",
  get: ({ get }) => {
    const functionGroups = get(functionGroupState);
    return flatFunctions(functionGroups);
  },
});
