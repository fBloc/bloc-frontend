import { AtomValue } from "@/common";

export interface SourceFlow {
  _id: string;
  user: string;
  name: string;
  config: any[]; // TODO 类型完善
  front: Front;
  flow_type: string;
  perms: Perms;
  create_time: string;
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
  iconStyle: IconStyle;
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

export interface IconStyle {
  background: Background;
}

export enum Background {
  The6F8Df7 = "#6F8DF7",
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
  value: AtomValue;
}
