import request from "@/api/client";
import { LaunchedFlowListItem } from ".";
import { SearchOptions } from "../common";

export function getList({ contains = "" }: Partial<SearchOptions>) {
  return request.get<LaunchedFlowListItem[]>(`/api/v1/flow?name__contains=${contains}`);
}
