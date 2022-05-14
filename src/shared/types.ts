import { BlocRunRecord, ParamOpt, StatefulMergedIptParam } from "@/api/flow";
import { FnAtom, FunctionItem } from "@/api/functions";
import { NodeProps } from "react-flow-renderer";
import { FlowDisplayPage } from "./enums";

/**
 * 最小单位的参数设置类型
 */
export type PureQuery = Record<string, string | number>;

export type BaiscValueType = string | number | boolean | undefined | null;

export type ValueType = BaiscValueType | BaiscValueType[];

export type TruthyValue = NonNullable<ValueType>;

export type Position = { left: number; top: number };
export type Viewport = Position & { zoom: number };

export type SourceParam = Pick<FnAtom, "valueType" | "isArray"> & { nodeId: string };

export type BlocNodeItem = {
  id: string;
  note: string;
  /**
   * 节点的位置
   */
  position: Position;
  /**
   * 所依赖的functionID
   */
  function: FunctionItem | null;
  /**
   * 输入参数的设置
   */
  paramIpt: StatefulMergedIptParam[];
  /**
   * 输出的参数
   */
  paramOpt: ParamOpt[];
  /**
   * 流程输入
   */
  voidIpt: string[];
  /**
   * 流程输出
   */
  voidOpt: string[];
  /**
   * 运行情况：成功或失败等
   */
  latestRunningInfo: BlocRunRecord | null;
};

/**
 * 设置参数时的记录类型
 */
export type OperationRecord = {
  type: "disconnect" | "connect";
  source: {
    nodeId: string;
    param?: string;
  };
  target: {
    nodeId: string;
    param?: string;
    atomIndex?: number;
  };
  isFlow?: boolean;
};
export enum ConnectionType {
  fixed,
  /**
   * 不确定的连接
   */
  indeterminate,
}
export type Connection = {
  id: string;
  sourceNode: string | null;
  targetNode: string | null;
  sourceParam?: string | null;
  targetParam?: string | null;
  targetAtomIndex?: number[];
  type: ConnectionType;
};

export type TempConnection = Omit<Connection, "targetAtomIndex" | "type">;

export type FixedConnection = Omit<TempConnection, "id"> & { isVoid?: boolean; targetAtomIndex?: number };

export type ParamConnectionEnd = { nodeId: string | null; param?: string | null };

export type RemovedConnection = Pick<Connection, "id"> & {
  targetAtomIndex: number;
};

type ReactFlowElementData = {
  mode: FlowDisplayPage;
};

export type BlocNodeData = {
  /**
   * 依赖的function信息
   */
  function: FunctionItem | null;
  /**
   * 最近一次运行状态
   */
  /**
   * 运行情况：成功或失败等
   */
  latestRunningInfo: BlocRunRecord | null;
  id: string;
  paramOpts: ParamOpt[];
  statefulMergedIpts: StatefulMergedIptParam[];
  note: string;
  onRecordIconClick?: (node: NodeProps<BlocNodeData>) => void;
  isConnecting: boolean;
  connectableNodeIds: string[];
} & ReactFlowElementData;

export type EdgeData = {
  atomIndexList: number[];
} & ReactFlowElementData;

export type Connectable = {
  isConnectable: boolean;
};
