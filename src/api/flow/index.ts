import request from "@/api/client";
import { ISearchOptions, transformPosition } from "@/api/arrangement";
import { ParamTypeOptions, RunningEnum } from "@/common";
import { FlowRunningState } from "./launched";

export type ValueType = string | number | boolean | undefined | null;
export type TruthySimpleValue = NonNullable<string | number | boolean>;

export interface LatestRun {
  time: string;
  status: RunningEnum;
}

export interface BlocItem {
  /**
   * 节点id
   */
  id: string;
  function_id: string;
  note: string;
  position: {
    left: number;
    top: number;
  };
  upstream_flowfunction_ids: string[];
  downstream_flowfunction_ids: string[];
  param_ipts?: ParamIpt[][];
}

export type ParamIpt = {
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

export const atomSetterTemplate: ParamIpt = {
  blank: true,
  ipt_way: IptWay.UserIpt,
  value: "",
  value_type: ParamTypeOptions.string,
};

export * from "./draft";
export * from "./launched";
export * from "./common";
