/**
 * 列表相关
 */
import request from "@/shared/request";
import { OriginBaseFlow } from "../originTypes";
import { SearchOptions } from "../types";
export function getDraftList(params: Partial<SearchOptions>) {
  return request.get<OriginBaseFlow[]>("/api/v1/draft_flow", {
    data: {
      name__contains: params.contains ?? "",
    },
  });
}
