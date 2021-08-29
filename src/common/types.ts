export type Nullable<T> = T | null;
export type Noop = () => void | Promise<void>;
export interface Position {
  left: number;
  top: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export type DangerousAny = any;

export type BlocId = string;

export type UserId = string;
export enum ParamTypeOptions {
  int = "int",
  float = "float",
  string = "string",
  json = "json",
  bool = "bool",
}

export type AtomBasicValue = string | number | boolean | null;
export type AtomValue = AtomBasicValue | Array<AtomBasicValue>;

/** 基础的参数描述 */
export interface ParamDescriptor {
  keyName: string;
  type: ParamTypeOptions;
  hint: string | null;
}

/** 关联参数的最小单位 */
export interface AtomDescriptor {
  multiple: boolean;
  hint: string | null;
  prefix: null;
  suffix: null;
  type: ParamTypeOptions;
  value: AtomValue;
  options?: {
    label: string;
    value: AtomBasicValue;
  }[];
}
/** 函数的入参类型定义 */
export interface InputParam extends Omit<ParamDescriptor, "type"> {
  atoms: AtomDescriptor[];
  display: string;
  required: boolean;
}

/** 函数的出参类型定义 */
export type OutputParam = ParamDescriptor;

/** 函数定义 */
export interface FunctionItem {
  id: number;
  name: string;
  brief: string;
  /** 所在组的名称 */
  groupName: string;
  input: InputParam[];
  output: OutputParam[];
}

export type BlocGroup = {
  groupName: string;
  groupId: number;
  children: FunctionItem[];
};
/** 函数列表 */
export type BlocList = BlocGroup[];
/**
 * 类型一：通过配对
 */
export interface Pair {
  type: AppAtomSetMethod.pair;
  blocId: string;
  keyName: string;
}
/**
 * 类型二：用户表单输入
 */
export interface Input {
  type: AppAtomSetMethod.input;
  value: AtomValue;
}
export enum AppAtomSetMethod {
  input = "input",
  pair = "pair",
}

export interface BlocNode {
  id: string;
  name: string;
  position: {
    left: number;
    top: number;
  };
  connections: {
    upstream: string[];
    downstream: string[];
  };
  inputParamConf: ((Pair | Input | null)[] | null)[];
  function: FunctionItem;
}
