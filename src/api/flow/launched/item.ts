import request from "@/api/client";
import { BaseFlowItem, normalizeFlowDetail, ResultState } from "@/api/flow/common";
import { RunningEnum } from "@/common";
import { FlowDetailT } from "../common";

/**
 * 手动触发运行
 */
export function triggerRun({ flowOriginId, userToken }: { flowOriginId: string; userToken: string }) {
  return request.post("/api/v1/flow_history", {
    flow_origin_id: flowOriginId,
    trigger_user_token: userToken,
  });
}

export interface FlowRunningState {
  id: string;
  arr_id: string;
  arrangement_task_id: string;
  arrangement_flow_id: string;
  flow_id: string;
  flow_origin_id: string;
  trigger_time: string;
  start_time: string;
  end_time: string;
  status: RunningEnum;
  error_msg: string;
  retryed_amount: number;
  flowblocid_map_blochistoryid: { [key: string]: string };
  cancel_user_name?: string;
}

/**
 * 获取最近的运行历史
 */
export function getLatestRunningState(flowId: string) {
  return request.get<FlowRunningState[]>(`api/v1/flow_run_record?flow_id=${flowId}&offset=0&limit=10`);
}

export function getHistoryFlow(flowId: string) {
  return request.get<BaseFlowItem>(`/api/v1/old_version_flow/${flowId}`).then(normalizeFlowDetail); // 接口
}

/**
 * 删除项目
 */
export function deleteItem(originId: string) {
  return request.delete(`/api/v1/flow/${originId}`);
}

export function updateDetail(params: Partial<FlowDetailT> & Pick<FlowDetailT, "id">) {
  return request.patch<ResultState>("/api/v1/flow", params);
}

export function getDetail(originId: string) {
  return request.get<BaseFlowItem>(`/api/v1/flow/get_latestonline_by_origin_id/${originId}`).then(normalizeFlowDetail);
}
