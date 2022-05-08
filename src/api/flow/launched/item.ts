import request from "@/shared/request";
import { normalizeFlowDetail, ResultState } from "@/api/flow/common";
import { Nullable } from "@/shared/types";
import { OriginBaseFlow } from "../originTypes";
import { FlowDetailT } from "../types";
import { RunningStatusEnum, TriggerTypes } from "@/shared/enums";

/**
 * 手动触发运行
 */
export function triggerRun({ flowOriginId }: { flowOriginId: string }) {
  return request.get(`/api/v1/flow/run/by_origin_id/${flowOriginId}`);
}

export interface FlowRunningStatusResponse {
  items: Nullable<FlowRunningStatus[]>;
  total: number;
}
export interface FlowRunningStatus {
  id: string;
  arrangement_id: string;
  flow_id: string;
  flow_origin_id: string;
  flowFunctionID_map_functionRunRecordID: { [key: string]: string };
  trigger_type: TriggerTypes;
  trigger_key: string;
  trigger_source: number;
  trigger_user_name: string;
  trigger_time: number;
  start_time: number | null;
  end_time: number | null;
  status: RunningStatusEnum; // TODO 类型
  error_msg: string;
  retried_amount: number;
  timeout_canceled: boolean;
  canceled: boolean;
  cancel_user_name: string;
  flow_version: number;
}

/**
 * 只有是运行成功或失败的任务才有结束时间，否则应为空
 */
function normalizeEndTime(status: RunningStatusEnum, value: number | null) {
  const notEnd = [RunningStatusEnum.created, RunningStatusEnum.queue, RunningStatusEnum.running].includes(status);
  return notEnd ? null : value;
}

/**
 * 任务未开始时，没有开始时间
 */
function normalizeStartTime(status: RunningStatusEnum, value: number | null) {
  const notStart = [RunningStatusEnum.queue, RunningStatusEnum.created, RunningStatusEnum.rejected].includes(status);
  return notStart ? null : value;
}

/**
 * 获取最近的运行记录历史
 */
export function getLatestRunningRecords({
  flowOriginId,
  offset = 0,
  limit = 10,
}: {
  flowOriginId: string;
  offset?: number;
  limit?: number;
}) {
  return request
    .get<FlowRunningStatusResponse>("api/v1/flow_run_record", {
      data: {
        flow_origin_id: flowOriginId,
        offset,
        limit,
      },
    })
    .then((res) => {
      return {
        ...res,
        data: {
          ...res.data,
          items: res.data?.items?.map((item) => ({
            ...item,
            start_time: normalizeStartTime(item.status, item.start_time),
            end_time: normalizeEndTime(item.status, item.end_time),
            // TODO 时间设置
          })),
        },
      };
    });
}

/**
 * 删除项目
 */
export function deleteItem(originId: string) {
  return request.delete(`/api/v1/flow/delete_by_origin_id/${originId}`);
}

export function updateDetail(params: Partial<FlowDetailT> & Pick<FlowDetailT, "id">) {
  return request.patch<ResultState>("/api/v1/flow", params);
}

export interface FlowSettings {
  crontab: string;
  trigger_key: string;
  timeout_in_seconds: number;
  retry_amount: number;
  retry_interval_in_second: number;
  allow_parallel_run: boolean;
}
/**
 * 更新flow设置
 */
export function updateSettings(params: Partial<FlowSettings> & { id: string }) {
  return request.patch("/api/v1/flow/set_execute_control_attributes", params);
}

export type LatestFlowDetailT = FlowDetailT & {
  latest_run?: Pick<FlowRunningStatus, "start_time" | "end_time" | "status" | "error_msg">;
};

export function getDetail(originId = "") {
  return request
    .get<OriginBaseFlow>(`/api/v1/flow/get_latestonline_by_origin_id/${originId}`)
    .then(normalizeFlowDetail);
}

/**
 * 获取某个历史版本的flow详情
 */
export function getSomeHistoryDetail(recordId: string) {
  return request.get<OriginBaseFlow>(`/api/v1/flow/get_by_flow_run_record_id/${recordId}`).then(normalizeFlowDetail);
}
/**
 * 获取节点记录详情
 */
export function getBlocRecordDetail(recordId: string) {
  return request.get<OriginBlocRecordDetail>(`/api/v1/function_run_record/get_by_id/${recordId}`).then((res) => ({
    ...res,
    data: washRecordDetail(res.data),
  }));
}

export interface OriginBlocRecordDetail {
  id: string;
  flow_id: string;
  flow_origin_id: string;
  arrangement_flow_id: string;
  function_id: string;
  flow_function_id: string;
  flow_run_record_id: string;
  start: number;
  end: number;
  trigger: number;
  suc: boolean;
  intercept_below_function_run: boolean;
  description: string;
  error_msg: string;
  ipt: Array<ResultPreview[]>;
  opt: Record<string, ResultPreview>;
  progress: number;
  progress_msg: null;
  process_stages: any[];
}

export interface ResultPreview {
  value_type: string;
  brief: string;
  object_storage_key: string;
}

export type BlocRecordDetail = Pick<
  OriginBlocRecordDetail,
  "id" | "ipt" | "opt" | "description" | "end" | "progress" | "start" | "trigger"
> & {
  flowId: OriginBlocRecordDetail["flow_id"];
  functionId: OriginBlocRecordDetail["function_id"];
  flowOriginId: OriginBlocRecordDetail["flow_origin_id"];
  arrangementFlowId: OriginBlocRecordDetail["arrangement_flow_id"];
  nodeId: OriginBlocRecordDetail["flow_function_id"];
  flowRecordId: OriginBlocRecordDetail["flow_run_record_id"];
  succuess: OriginBlocRecordDetail["suc"];
  isIntercepted: OriginBlocRecordDetail["intercept_below_function_run"]; // TODO 注释
  errorMsg: OriginBlocRecordDetail["error_msg"];
  progressMsg: OriginBlocRecordDetail["progress_msg"];
  processStages: OriginBlocRecordDetail["process_stages"];
};

export function washRecordDetail(detail: Nullable<OriginBlocRecordDetail>): BlocRecordDetail | null {
  if (!detail) return null;
  const {
    id,
    start,
    end,
    suc,
    trigger,
    progress,
    intercept_below_function_run,
    progress_msg,
    process_stages,
    error_msg,
    description,
    flow_id,
    flow_function_id,
    flow_run_record_id,
    flow_origin_id,
    ipt,
    opt,
    arrangement_flow_id,
    function_id,
  } = detail;
  return {
    id,
    flowId: flow_id,
    flowOriginId: flow_origin_id,
    arrangementFlowId: arrangement_flow_id,
    functionId: function_id,
    nodeId: flow_function_id,
    flowRecordId: flow_run_record_id,
    start,
    end,
    succuess: suc,
    isIntercepted: intercept_below_function_run, // TODO 注释
    description,
    errorMsg: error_msg,
    ipt,
    opt,
    progress,
    progressMsg: progress_msg,
    processStages: process_stages,
    trigger,
  };
}
