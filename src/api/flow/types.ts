import { IptWay, MergedIptParamStatus, ParamValueType, RunningStatusEnum } from "@/shared/enums";
import { Nullable, ValueType } from "@/shared/types";
import { FnAtom, IptParam } from "../functions";
import { Position, PrimitivePostionInfo, ReadablePositionInfo } from "./common";
import { FlowRunningStatus } from "./launched";

export interface SourceFlow {
  _id: string;
  user: string;
  name: string;
  config: any[]; // TODO 类型完善
  front: Front;
  flow_type: string;
  perms: Perms;
  create_time: number;
  status: string;
  run_history: unknown[];
}

export interface Front {
  edges: Edge[];
  nodes: Node[];
}

export interface Edge {
  src_node_id: number;
  src_output_idx: number;
  dst_node_id: number;
  dst_input_idx: number;
  id: number;
}

export interface Node {
  id: number;
  in_ports: number[];
  name: string;
  out_ports: number[];
  pos_x: number;
  pos_y: number;
  iconClassName?: string;
  nameDescribe?: string;
  zh?: string;
  disabled?: boolean;
  zh_total?: string;
  panel_set?: PanelSet[];
  need_set?: boolean;
  final_values?: FinalValues;
}

export interface FinalValues {
  numbers?: string;
  calcu_way?: string;
  calcu_base?: string;
  content?: string;
  condition?: string;
}

export interface PanelSet {
  must: boolean;
  name: string;
  title: string;
  value: null;
  fields: Field[];
}

export interface Field {
  type: Type;
  prefix: null;
  suffix: null;
  values: string;
  hint: null | string;
  options?: Option[];
}

export interface Option {
  display: string;
  value: string;
}

export enum Type {
  MultilineText = "multiline-text",
  Select = "select",
  Text = "text",
}

export interface Perms {
  pengsixiong: Pengsixiong;
  root: Root;
}

export interface Pengsixiong {
  read: boolean;
  write: boolean;
  exe: boolean;
}

export interface Root {
  read: boolean;
  write: boolean;
}

export enum AppAtomSetMethod {
  input = "input",
  pair = "pair",
}
/** 类型一：通过配对 */
export interface Pair {
  type: AppAtomSetMethod.pair;
  blocId: string;
  keyName: string;
}
/** 类型二：用户表单输入 */
export interface Input {
  type: AppAtomSetMethod.input;
  value: ValueType;
}
export type ParamOpt = {
  nodeId: string;
  key: string;
  description: string;
  valueType: ParamValueType;
  isArray: boolean;
  targetList: {
    nodeId?: string;
    param?: string;
    atomIndex?: number;
  }[];
};
export interface FlowBlocNode<T = Position[]> {
  functionId: string;
  note: string;
  position: Nullable<T>;
  sourceNodeIds: string[];
  targetNodeIds: string[];
  paramIpts: EditAtom[][];
}

export type BlocRunRecord = {
  recordId: string;
  status: RunningStatusEnum;
  startTime: number | null;
  endTime: number | null;
};

export interface BaseFlow<PositionT = PrimitivePostionInfo> {
  id: string;
  position: PositionT | null;
  nodeToBlocMap: Record<string, FlowBlocNode<PositionT>>;
  name: string;
  isDraft: boolean;
  version: number;
  originId: string;
  newest: boolean;
  createUserId: string;
  createUserName: string;
  createTime: number;
  crontab: string;
  triggerKey: string;
  timeoutInSeconds: number;
  retryAmount: number;
  retryIntervalInSecond: number;
  allowParallelRun: boolean;
  /**
   * 权限相关
   * @see https://github.com/fBloc/bloc/issues/5
   */
  read: boolean;
  write: boolean;
  execute: boolean;
  delete: boolean;
  assignPermission: boolean;
  allowTriggerByKey: boolean;
  latestRun: FlowRunningStatus | null; //TODO 位置
  latestRunRecordsMap: Record<
    /**
     * nodeId
     */
    string,
    BlocRunRecord | undefined
  > | null;
}

export interface EditAtom {
  unset: boolean;
  iptWay: IptWay;
  valueType: ParamValueType;
  value: unknown;
  sourceNode: string;
  sourceParam: string;
}

export interface SearchOptions {
  contains: string;
}

// export interface LatestRun {
//   time: string;
//   status: RunningStatusEnum;
// }
export type FlowDetailT = BaseFlow<ReadablePositionInfo>;
export type FullStateAtom = EditAtom &
  FnAtom & { atomIndex?: number; nodeId?: string; parentParam?: string; readableValue: string };

export type MergedInputParam = Pick<IptParam, "description" | "key" | "required"> & {
  atoms: FullStateAtom[];
};

/**
 * 编辑状态时参数的相关数据信息
 */
export type StatefulMergedIptParam = MergedInputParam & {
  /**
   *  完成进度，0-1
   */
  progress: number;
  status: MergedIptParamStatus;
  index: number;
};
