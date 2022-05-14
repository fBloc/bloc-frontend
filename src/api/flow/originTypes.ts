import { IptWay, ParamValueType, RunningStatusEnum } from "@/shared/enums";

import { Position, PrimitivePostionInfo, ReadablePositionInfo } from "./common";
import { FlowRunningStatus } from "./launched";

export interface OriginEditAtom {
  blank: boolean;
  ipt_way: IptWay;
  value_type: ParamValueType;
  value: unknown;
  flow_function_id: string;
  key: string;
}

export interface OriginFlowBlocNode<T = Position[]> {
  function_id: string;
  note: string;
  position: T | null;
  upstream_flowfunction_ids: string[];
  downstream_flowfunction_ids: string[];
  param_ipts: OriginEditAtom[][];
}

export interface OriginBaseFlow<PositionT = PrimitivePostionInfo> {
  id: string;
  position: PositionT | null;
  flowFunctionID_map_flowFunction: Record<string, OriginFlowBlocNode<PositionT>>;
  name: string;
  is_draft: boolean;
  version: number;
  origin_id: string;
  newest: boolean;
  create_user_id: string;
  create_user_name: string;
  create_time: number;
  crontab: string;
  trigger_key: string;
  timeout_in_seconds: number;
  retry_amount: number;
  retry_interval_in_second: number;
  allow_parallel_run: boolean;
  /**
   * 是否允许使用key触发
   */
  allow_trigger_by_key: boolean;
  /**
   * 权限相关
   * @see https://github.com/fBloc/bloc/issues/5
   */
  read: boolean;
  write: boolean;
  execute: boolean;
  delete: boolean;
  assign_permission: boolean;
  latest_run: FlowRunningStatus | null; //TODO 位置
  latestRun_flowFunctionID_map_functionRunInfo: Record<
    string,
    | {
        function_run_record_id: string;
        status: RunningStatusEnum;
        start_time: number | null;
        end_time: number | null;
      }
    | undefined
  > | null;
}

export type ReadableOriginBaseFlow = OriginBaseFlow<ReadablePositionInfo>;
