import request from "@/api/client";
import { BaseFlowItem, DraftFlowListItem, FlowDetailT, normalizeFlowDetail } from "@/api/flow/common";
import { simpleNanoId } from "@/utils";

/**
 * 创建草稿
 */
export function createDraft(
  content: Partial<Pick<FlowDetailT, "flowFunctionID_map_flowFunction" | "name" | "position">> & {
    origin_id: string;
  },
) {
  return request.post<DraftFlowListItem>("/api/v1/draft_flow", {
    name: `未命名flow_${simpleNanoId()}`,
    ...content,
  });
}

/**
 * 更新草稿
 */
export function updateDraft(params: Partial<FlowDetailT>) {
  return request.patch<{ suc: boolean }>("/api/v1/draft_flow", params);
}

/**
 * 获取草稿
 */
export function getDraft(originId: string) {
  return request.get<BaseFlowItem>(`/api/v1/draft_flow/${originId}`).then(normalizeFlowDetail);
}
/**
 * 删除草稿
 */
export function deleteDraft(originId: string) {
  return request.delete(`/api/v1/draft_flow/${originId}`);
}

/**
 * 发布
 */
export function launch(draftId: string) {
  return request.get(`/api/v1/draft_flow/${draftId}/commit`);
}
