import request from "@/api/client";
import { DraftFlowListItem, LatestRun, SearchOptions } from "../common";

export type LaunchedFlowListItem = DraftFlowListItem & {
  latest_run: LatestRun;
};
export function getList({ contains = "" }: Partial<SearchOptions>) {
  return request.get<LaunchedFlowListItem[]>(`/api/v1/flow?name__contains=${contains}`);
}
