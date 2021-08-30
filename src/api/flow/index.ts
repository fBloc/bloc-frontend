import { ISearchOptions, transformPosition } from "@/api/arrangement";
import { Nullable, ParamTypeOptions, RunningEnum } from "@/common";
import request from "@/api/client";
import { login } from "@/store";

export const getFlowList = () => {
  return request.get<IFlow[]>("/api/v1/flow");
};
export type ValueType = Nullable<string | number | boolean | undefined>;

export interface IFlow {
  id: string;
  origin_id: string;
  name: string;
  position: {
    left: number;
    top: number;
    zoom: number;
  };
  blocs: Record<string, IBloc>;
  is_draft: boolean;
  create_user_name: string;
  read: boolean;
  write: boolean;
  execute: boolean;
  super: boolean;
  create_time: string;
  latest_run?: {
    status: RunningEnum;
    time: string;
  };
}

export interface IBloc {
  /**
   * 节点id
   */
  id: string;
  bloc_id: string;
  note: string;
  position: {
    left: number;
    top: number;
  };
  upstream_bloc_ids: string[];
  downstream_bloc_ids: string[];
  param_ipts: IParamIpt[][];
}

export type IParamIpt = {
  blank: boolean;
  ipt_way: IptWay;
  value_type: ParamTypeOptions;
  value: ValueType | ValueType[];
  flow_bloc_id?: string;
  key?: string;
} | null;

export enum BlocID {
  Empty = "",
  The08B3Dc190Ad588A63F0B99420Eb8436B = "08b3dc190ad588a63f0b99420eb8436b",
}

export enum IptWay {
  Connection = "connection",
  UserIpt = "user_ipt",
}

export interface Position {
  Key: KeyEnum;
  Value: number;
}

export enum KeyEnum {
  Left = "left",
  Top = "top",
  Zoom = "zoom",
}

export interface Patch {
  suc: boolean;
}

export function getFlow() {
  return Promise.resolve({
    isValid: true,
    data: [],
  });
}

export function createDraft(conf: Partial<Pick<IFlow, "position" | "blocs" | "name">> & { origin_id: string }) {
  return request.post<IFlow>("/api/v1/flow_draft", {
    name: conf.name || `未命名${Date.now().toString().slice(-4)}`,
    ...conf,
    create_user_id: login.token,
  });
}
export function updateDraft(params: Partial<IFlow>) {
  return request.patch<Patch>("/api/v1/flow_draft", params);
}
export function getDraft(originId: string) {
  return request.get<IFlow>(`/api/v1/flow_draft/${originId}`).then((res) => {
    if (res.data) {
      res.data.position = transformPosition(res.data.position);
      for (const id in res.data.blocs || {}) {
        res.data.blocs[id] = {
          ...res.data.blocs[id],
          position: transformPosition(res.data.blocs[id].position),
        };
      }
    }
    return res;
  });
}
export function getDetail(originId: string) {
  return request.get<IFlow>(`/api/v1/flow/${originId}`).then((res) => {
    if (res.data) {
      res.data.position = transformPosition(res.data.position);
      for (const id in res.data.blocs || {}) {
        res.data.blocs[id] = {
          ...res.data.blocs[id],
          position: transformPosition(res.data.blocs[id].position),
        };
      }
    }
    return res;
  });
}
export function getList({ contains = "" }: Partial<ISearchOptions>) {
  return request.get<IFlow[]>(`/api/v1/flow?name__contains=${contains}`);
}
export function getDraftList({ contains = "" }: Partial<ISearchOptions>) {
  return request.get<IFlow[]>(`/api/v1/flow_draft?name__contains=${contains}`);
}

export function deleteItem(originId: string) {
  return request.delete(`/api/v1/flow/${originId}`);
}
export function deleteDraft(originId: string) {
  return request.delete(`/api/v1/flow_draft/${originId}`);
}

/**
 * 发布
 */
export function launch(draftId: string) {
  return request.get(`/api/v1/flow_draft/${draftId}/commit`);
}
export const atomSetterTemplate: IParamIpt = {
  blank: true,
  ipt_way: IptWay.UserIpt,
  value: "",
  value_type: ParamTypeOptions.string,
};

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
  status: string;
  error_msg: string;
  retryed_amount: number;
  flowblocid_map_blochistoryid: { [key: string]: string };
}
/**
 * 获取最近一次运行状况
 */
export function getLatestRunningState(flowId: string) {
  return request.get<FlowRunningState[]>(`/api/v1/flow_history?flow_id=${flowId}&offset=0&limit=1`).then((res) => ({
    ...res,
    data: res.data?.[0] || null,
  }));
}
