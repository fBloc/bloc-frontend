import request from "@/api/client";
import { BaseFlowItem, FlowDetailT, normalizeFlowDetail, ResultState } from "@/api/flow/common";
import { simpleNanoId } from "@/utils";

/**
 * 创建草稿
 */
export function createDraft(
  content: Partial<Pick<FlowDetailT, "flowFunctionID_map_flowFunction" | "name" | "position">> & {
    origin_id?: string;
  },
) {
  return request.post<BaseFlowItem>("/api/v1/draft_flow", {
    name: `未命名flow_${simpleNanoId()}`,
    ...content,
  });
}

/**
 * 更新草稿
 */
export function updateDraft(params: Partial<FlowDetailT>) {
  return request.patch<ResultState>("/api/v1/draft_flow", params);
}

/**
 * 获取草稿
 */
export function getDraft(originId: string) {
  return request.get<BaseFlowItem>(`/api/v1/draft_flow/get_by_origin_id/${originId}`).then(normalizeFlowDetail);
}
/**
 * 删除草稿
 */
export function deleteDraft(originId: string) {
  return request.delete(`/api/v1/draft_flow/delete_by_origin_id/${originId}`);
}

/**
 * 发布
 */
export function launch(draftId: string) {
  return request.get(`api/v1/draft_flow/commit_by_id/${draftId}`);
}
