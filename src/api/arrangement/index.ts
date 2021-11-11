import { Nullable, Position, DangerousAny } from "@/common";
import request from "@/api/client";
import { login } from "@/store";
export interface ISearchOptions {
  contains: string;
}
export const getList = ({ contains = "" }: Partial<ISearchOptions> = { contains: "" }) => {
  return request.get<Arrangement[]>(`/api/v1/arrangement?name__contains=${contains}`);
};
export const getDraftList = ({ contains = "" }: Partial<ISearchOptions> = { contains: "" }) => {
  return request.get<Arrangement[]>(`/api/v1/arrangement_draft?name__contains=${contains}`);
};

export interface Arrangement {
  id: string;
  origin_id: string;
  name: string;
  crontab: string;
  trigger_key: string;
  arrangement_flows: Record<string, IArrangementFlow>;
  create_user_name: string;
  read: boolean;
  write: boolean;
  super: boolean;
  execute: boolean;
  create_time: string;
  position: RectDomInfo;
}

type ISourcePositionInfo = {
  Key: string;
  Value: string | number;
};

export interface IArrangementFlow {
  flow_origin_id: string;
  retry_amount: number;
  retry_interval_in_second: number;
  stop_if_fail: boolean;
  upstream_flow_ids: string[] | null;
  downstream_flow_ids: string[] | null;
  position: Position;
}
export const transformPosition = (source: DangerousAny) => {
  const isObject = Object.prototype.toString.call(source);
  if (!Array.isArray(source) && !isObject) return { left: 0, top: 0 };
  if (isObject) return source;
  return source.reduce(
    (acc: Record<ISourcePositionInfo["Key"], ISourcePositionInfo["Value"]>, item: ISourcePositionInfo) => {
      return {
        ...acc,
        [item.Key]: item.Value || 0,
      };
    },
    {},
  );
};

type RectDomInfo = Record<"left" | "top" | "zoom", number>;
export interface IUpdateArrangement {
  id: string;
  name?: string;
  crontab?: string;
  trigger_key?: string;
  arrangement_flows?: Record<string, IArrangementFlow>;
  position?: RectDomInfo;
}
export function patchArrangement(params: IUpdateArrangement) {
  return request.patch("/api/v1/arrangement", params);
}

export function getDetail(id: string) {
  return request.get<Arrangement>(`/api/v1/arrangement/${id}`).then((res) => {
    if (!res.data) return res;
    const sourceFlows = res.data?.arrangement_flows as DangerousAny;
    res.data.position = transformPosition(res.data.position);
    for (const key in sourceFlows) {
      sourceFlows[key].position = transformPosition(sourceFlows[key].position);
    }
    return res;
  });
}
export function createArrangement() {
  const params = {
    name: "未命名编排",
    crontab: "",
    trigger_key: "",
    position: {
      left: 400,
      top: 40,
    },
    arrangement_flows: {
      "0": {
        downstream_flow_ids: [],
      },
    },
  };
  return request.post("/api/v1/arrangement", params);
}
export function deleteItem(originId: string) {
  return request.delete(`/api/v1/arrangement/${originId}`);
}
export function deleteDraft(originId: string) {
  return request.delete(`/api/v1/arrangement_draft/${originId}`);
}

export function getHistory(id: string) {
  return request.get(`/api/v1/arrangement_history?arrangement_id=${id}`);
}
export function getDraft(id: string) {
  return request.get<Nullable<Arrangement>>(`/api/v1/arrangement_draft/${id}`).then((res) => {
    if (!res.data) return res;
    const sourceFlows = res.data?.arrangement_flows as DangerousAny;
    res.data.position = transformPosition(res.data.position);
    for (const key in sourceFlows) {
      sourceFlows[key].position = transformPosition(sourceFlows[key].position);
    }
    return res;
  });
}
export function createDraft(
  options: Partial<
    Pick<Arrangement, "arrangement_flows" | "name" | "origin_id" | "trigger_key" | "crontab" | "position">
  >,
) {
  const params = {
    name: "未命名编排",
    crontab: "",
    trigger_key: "",
    position: {
      left: 400,
      top: 40,
    },
    arrangement_flows: {
      "0": {
        downstream_flow_ids: [],
      },
    },
    ...options,
  };
  return request.post<Nullable<Arrangement>>("/api/v1/arrangement_draft", params);
}
export function updateDraft(params: Partial<IUpdateArrangement>) {
  return request.patch("/api/v1/arrangement_draft", params);
}
export function launch(draftId: string) {
  return request.get(`/api/v1/arrangement_draft/${draftId}/commit`);
}

export function getPermission(id: string) {
  const userId = login.token;
  return request.get<Record<"read" | "write" | "excute" | "super", boolean>>(
    `/api/v1/arrangement_permission?user_id=${userId}&arrangement_id=${id}`,
  );
}
export function run({
  originId,
  triggerType = "hand",
}: {
  originId: string;
  triggerType?: "key" | "crontab" | "hand";
}) {
  return request.post("/api/v1/arrangement_history", {
    arrangement_origin_id: originId,
    trigger_type: triggerType,
  });
}
