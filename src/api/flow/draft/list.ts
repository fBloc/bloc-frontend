/**
 * 列表相关
 */
import request from "@/api/client";
import { DraftFlowListItem, SearchOptions } from "@/api/flow/common";

export function getDraftList({ contains = "" }: Partial<SearchOptions>) {
  return request.get<DraftFlowListItem[]>(`/api/v1/draft_flow?name__contains=${contains}`);
}
