import { Nullable } from "@/common";
import { isObject } from "@/utils";

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

export interface ParamIpt {
  blank: boolean;
  ipt_way: IptWay;
  value_type: ValueType;
  value: number[] | number | string | string;
  flow_function_id: string;
  key: string;
}

export enum IptWay {
  Connection = "connection",
  UserIpt = "user_ipt",
}

export enum ValueType {
  Int = "int",
  String = "string",
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

export function normalizeFlowDetail<T extends { data?: Nullable<WithPositionFlowItem> }>(
  source: T,
): Omit<T, "data"> & { data?: Nullable<WithPositionFlowItem<ReadablePositionInfo>> } {
  const data = source.data;
  if (!data)
    return {
      ...source,
      data,
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
