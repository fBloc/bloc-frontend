import { Nullable, ParamTypeOptions, RunningEnum } from "@/common";
import { isObject } from "@/utils";
import { LaunchedFlowListItem } from ".";

/**
 * 列表下，flow的position信息较为特殊
 */
export type PrimitivePostionInfo = Position[];
export type ReadablePositionInfo = Partial<Record<Position[keyof Position], number>>;

export interface BaseFlowItem<PositionT = PrimitivePostionInfo> {
  id: string;
  position: PositionT | null;
  flowFunctionID_map_flowFunction: Record<string, FlowBlocNodeItem<PositionT>>;
  name: string;
  is_draft: boolean;
  version: number;
  origin_id: string;
  newest: boolean;
  create_user_id: string;
  create_user_name: string;
  create_time: string;
  crontab: string;
  trigger_key: string;
  timeout_in_seconds: number;
  retry_amount: number;
  retry_interval_in_second: number;
  pub_while_running: boolean;
  read: boolean;
  write: boolean;
  execute: boolean;
  super: boolean;
  flowFunctionID_map_status: null; // TODO 类型完善
}

export interface WithPositionFlowItem<PositionT = PrimitivePostionInfo> {
  id: string;
  position: Nullable<PositionT>;
  flowFunctionID_map_flowFunction: Record<string, FlowBlocNodeItem<PositionT>>;
}

/**
 * flow详情，原始数据
 */
export interface DraftFlowListItem extends BaseFlowItem {}

export interface FlowBlocNodeItem<T = Position[]> {
  function_id: string;
  note: string;
  position: Nullable<T>;
  upstream_flowfunction_ids: string[];
  downstream_flowfunction_ids: string[];
  param_ipts: Array<ParamIpt[]>;
}

export type BlocItem = {
  /**
   * 节点id
   */
  id: string;
} & FlowBlocNodeItem<ReadablePositionInfo>;

export interface ParamIpt {
  blank: boolean;
  ipt_way: IptWay;
  value_type: ParamTypeOptions;
  value: ValueType | ValueType[];
  flow_function_id: string;
  key: string;
}

export enum IptWay {
  Connection = "connection",
  UserIpt = "user_ipt",
}

export interface Position {
  Key: "left" | "top" | "zoom";
  Value: number;
}

const transformPosition = (source: any): ReadablePositionInfo => {
  const isObjectType = isObject(source);
  if (!Array.isArray(source) && !isObjectType) return { left: 0, top: 0 };
  if (isObjectType) return source;
  type DomInfoItem = PrimitivePostionInfo[number];
  return source.reduce((acc: Record<DomInfoItem["Key"], DomInfoItem["Value"]>, item: DomInfoItem) => {
    return {
      ...acc,
      [item.Key]: item.Value || 0,
    };
  }, {});
};

export function normalizeFlowDetail<T extends { data?: Nullable<BaseFlowItem> }>(
  source: T,
): Omit<T, "data"> & { data: Nullable<BaseFlowItem<ReadablePositionInfo>> } {
  const data = source.data;
  if (!data)
    return {
      ...source,
      data: null,
    };
  return {
    ...source,
    data: {
      ...data,
      position: transformPosition(data.position),
      flowFunctionID_map_flowFunction: Object.entries(data.flowFunctionID_map_flowFunction).reduce(
        (acc: Record<string, FlowBlocNodeItem<ReadablePositionInfo>>, [id, detail]) => {
          return {
            ...acc,
            [id]: {
              ...detail,
              position: transformPosition(detail.position),
            },
          };
        },
        {},
      ),
    },
  };
}

export type FlowDetailT = BaseFlowItem<ReadablePositionInfo>;
export interface SearchOptions {
  contains: string;
}

export interface LatestRun {
  time: string;
  status: RunningEnum;
}

export function isLaunchedFlow(flow: any): flow is LaunchedFlowListItem {
  return "latest_run" in flow;
}

export type ValueType = string | number | boolean | undefined | null;
export type TruthySimpleValue = NonNullable<ValueType>;

export interface ResultState {
  suc: boolean;
}

export const atomSetterTemplate: Partial<ParamIpt> = {
  blank: true,
  ipt_way: IptWay.UserIpt,
  value: "",
  value_type: ParamTypeOptions.string,
};
