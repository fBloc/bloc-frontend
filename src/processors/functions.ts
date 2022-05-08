import { FunctionGroup, FunctionItem } from "@/api/functions";

export function flatFunctions(functionGroups: FunctionGroup[]) {
  return functionGroups.reduce((acc: FunctionItem[], item) => [...acc, ...item.functions], []);
}
