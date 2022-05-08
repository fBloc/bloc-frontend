import request from "@/shared/request";
import { OriginBaseFlow } from "../originTypes";
import { SearchOptions } from "../types";

export function getList({ contains = "" }: Partial<SearchOptions>) {
  return request.get<OriginBaseFlow[]>(`/api/v1/flow`, {
    data: {
      name__contains: contains,
      without_fields: "ipt,opt",
    },
  });
}
