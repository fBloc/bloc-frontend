import request from "@/shared/request";
import { simpleNanoId } from "@/shared/tools";
import { normalizeFlowDetail, ResultState } from "../common";
import { OriginBaseFlow, ReadableOriginBaseFlow } from "../originTypes";

type BaseParams = Partial<Pick<ReadableOriginBaseFlow, "flowFunctionID_map_flowFunction" | "name" | "position">> & {
  origin_id?: string;
};
/**
 * 创建草稿
 */
export function createDraft(content?: BaseParams) {
  return request
    .post<OriginBaseFlow>("/api/v1/draft_flow", {
      name: `未命名flow_${simpleNanoId()}`,
      ...content,
    })
    .then(normalizeFlowDetail);
}

/**
 * 更新草稿
 */
export function updateDraft(params: Partial<ReadableOriginBaseFlow> & Pick<OriginBaseFlow, "id" | "origin_id">) {
  return request.patch<ResultState>("/api/v1/draft_flow", params);
}

/**
 * 获取草稿
 */
export function getDraft(originId: string) {
  return request.get<OriginBaseFlow>(`/api/v1/draft_flow/get_by_origin_id/${originId}`).then(normalizeFlowDetail);
  // return request.get<OriginBaseFlow>(`/api/v1/draft_flow/${originId}`).then(normalizeFlowDetail);
}

export async function getOrCreateDraft(originId = "") {
  return request
    .get<OriginBaseFlow>(`/api/v1/draft_flow/get_or_create_for_flow_by_origin_id/${originId}`)
    .then(normalizeFlowDetail);
}

export async function copyAsDraft(originId = "") {
  return request
    .get<OriginBaseFlow>(`/api/v1//draft_flow/create_brand_new_from_flow_by_origin_id/${originId}`)
    .then(normalizeFlowDetail);
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
  return request.get<OriginBaseFlow>(`api/v1/draft_flow/commit_by_id/${draftId}`).then(normalizeFlowDetail);
}
