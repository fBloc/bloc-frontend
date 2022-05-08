import { RunningStatusEnum } from "@/shared/enums";
import { blocId, isObject } from "@/shared/tools";
import { Nullable } from "@/shared/types";
import { isPlainObject } from "lodash-es";
import { OriginFlowBlocNode, OriginBaseFlow, OriginEditAtom, ReadableOriginBaseFlow } from "./originTypes";
import { BaseFlow, EditAtom, FlowBlocNode, FlowDetailT } from "./types";
/**
 * 列表下，flow的position信息较为特殊
 */
export type PrimitivePostionInfo = Position[];
export type ReadablePositionInfo = Partial<Record<Position[keyof Position], number>>;

export interface WithPositionFlowItem<PositionT = PrimitivePostionInfo> {
  id: string;
  position: Nullable<PositionT>;
  flowFunctionID_map_flowFunction: Record<string, OriginFlowBlocNode<PositionT>>;
}

export type BlocItem = {
  /**
   * 节点id
   */
  id: string;
} & FlowBlocNode<ReadablePositionInfo>;

export interface Position {
  Key: "left" | "top" | "zoom";
  Value: number;
}

function washAtom(source: OriginEditAtom): EditAtom {
  if (!source) return source;
  const { blank, ipt_way, value, value_type, flow_function_id, key } = source;
  return {
    unset: blank,
    iptWay: ipt_way,
    value,
    valueType: value_type,
    sourceNode: flow_function_id,
    sourceParam: key,
  };
}
function washFlowBloc(source: OriginFlowBlocNode): FlowBlocNode<ReadablePositionInfo> {
  if (!source) return source;
  const { function_id, note, position, upstream_flowfunction_ids, downstream_flowfunction_ids, param_ipts } = source;
  return {
    functionId: function_id,
    note,
    position: transformPosition(position),
    sourceNodeIds: upstream_flowfunction_ids,
    targetNodeIds: downstream_flowfunction_ids,
    paramIpts: param_ipts.map((item) => item.map((atom) => washAtom(atom))),
  };
}

function washRunRecords(
  source: OriginBaseFlow["latestRun_flowFunctionID_map_functionRunInfo"],
): BaseFlow["latestRunRecordsMap"] {
  if (!source) return null;
  const result: BaseFlow["latestRunRecordsMap"] = {};
  for (const key in source) {
    result[key] = {
      recordId: source[key]?.function_run_record_id || "",
      status: source[key]?.status || RunningStatusEnum.created,
      startTime: source[key]?.start_time || null,
      endTime: source[key]?.end_time || null,
    };
  }
  return result;
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

export function normalizeFlowDetail<T extends { data?: Nullable<OriginBaseFlow> }>(
  source: T,
): Omit<T, "data"> & {
  data: BaseFlow<ReadablePositionInfo> | null;
} {
  const data = source.data;
  if (!data)
    return {
      ...source,
      data: null,
    };
  const {
    is_draft,
    origin_id,
    create_time,
    create_user_name,
    crontab,
    create_user_id,
    retry_amount,
    timeout_in_seconds,
    trigger_key,
    retry_interval_in_second,
    allow_parallel_run,
    assign_permission,
    latestRun_flowFunctionID_map_functionRunInfo,
    latest_run,
    flowFunctionID_map_flowFunction,
    allow_trigger_by_key,
    ...rest
  } = data;
  return {
    ...source,
    data: {
      ...rest,
      position: transformPosition(data.position),
      isDraft: is_draft,
      originId: origin_id,
      createUserId: create_user_id,
      createUserName: create_user_name,
      createTime: create_time,
      crontab,
      triggerKey: trigger_key,
      timeoutInSeconds: timeout_in_seconds,
      retryAmount: retry_amount,
      allowParallelRun: allow_parallel_run,
      assignPermission: assign_permission,
      latestRun: latest_run || null,
      allowTriggerByKey: allow_trigger_by_key,
      latestRunRecordsMap: washRunRecords(latestRun_flowFunctionID_map_functionRunInfo),
      retryIntervalInSecond: retry_interval_in_second,
      nodeToBlocMap: Object.entries(flowFunctionID_map_flowFunction).reduce(
        (acc: Record<string, FlowBlocNode<ReadablePositionInfo>>, [id, detail]) => {
          return {
            ...acc,
            [id]: washFlowBloc(detail),
          };
        },
        {},
      ),
    },
  };
}

export function isLaunchedFlow(flow: any) {
  return flow.is_draft === false;
}

export interface ResultState {
  suc: boolean;
}

export function washbackFlow({
  nodeToBlocMap,
  name,
  position,
  allowParallelRun,
  allowTriggerByKey,
  triggerKey,
  retryAmount,
  retryIntervalInSecond,
  timeoutInSeconds,
  crontab,
}: Partial<FlowDetailT>): Partial<ReadableOriginBaseFlow> {
  const result: ReadableOriginBaseFlow["flowFunctionID_map_flowFunction"] = {};
  if (nodeToBlocMap) {
    for (const key in nodeToBlocMap) {
      const { functionId, sourceNodeIds, targetNodeIds, paramIpts, ...rest } = nodeToBlocMap[key];
      result[key] = {
        function_id: functionId,
        upstream_flowfunction_ids: sourceNodeIds,
        downstream_flowfunction_ids: targetNodeIds,
        param_ipts: paramIpts.map((item) =>
          item.map(({ unset, iptWay, value, valueType, sourceNode, sourceParam }) => {
            const _value = Array.isArray(value)
              ? value.map((valueItem) => (isPlainObject(valueItem) ? valueItem.value : valueItem))
              : value;
            return {
              blank: unset,
              ipt_way: iptWay,
              value_type: valueType,
              value: _value,
              flow_function_id: sourceNode,
              key: sourceParam,
            };
          }),
        ),
        ...rest,
      };
    }
  }
  return {
    ...(nodeToBlocMap ? { flowFunctionID_map_flowFunction: result } : {}),
    ...(position ? { position } : {}),
    ...(name ? { name } : {}),
    ...(allowParallelRun === undefined ? {} : { allow_parallel_run: allowParallelRun }),
    ...(allowTriggerByKey === undefined ? {} : { allow_trigger_by_key: allowTriggerByKey }),
    ...(crontab === undefined ? {} : { crontab }),
    ...(triggerKey === undefined ? {} : { trigger_key: triggerKey }),
    ...(retryAmount === undefined ? {} : { retry_amount: retryAmount }),
    ...(retryIntervalInSecond === undefined ? {} : { retry_interval_in_second: retryIntervalInSecond }),
    ...(timeoutInSeconds === undefined ? {} : { timeout_in_seconds: timeoutInSeconds }),
  };
}

export const createBlocItem = (params: Partial<BlocItem>): BlocItem => {
  return {
    id: blocId(),
    functionId: "",
    note: "",
    position: { left: 400, top: 200 },
    sourceNodeIds: [],
    targetNodeIds: [],
    paramIpts: [],
    ...params,
  };
};
