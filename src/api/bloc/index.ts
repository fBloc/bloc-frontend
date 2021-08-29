import request from "@/api/client";
import { ValueType } from "@/api/flow";
import { BlocGroup, ParamTypeOptions } from "@/common";

export function getFunctions() {
  return request.get<BlocGroup[]>("/api/v1/bloc");
}

export interface IFunctionItem {
  description: string;
  id: string;
  ipt: Ipt[];
  name: string;
  opt: IOpt[];
}

export interface Ipt {
  key: string;
  display: string;
  must: boolean;
  components: IAtom[];
}

export enum FormControlType {
  input = "input",
  select = "select",
  textarea = "textarea",
  json = "json",
}
export interface IAtom {
  value_type: ParamTypeOptions;
  formcontrol_type: FormControlType;
  hint: string;
  default_value: ValueType;
  allow_multi: boolean;
  select_options: SelectOption[] | null;
}

export interface SelectOption {
  label: string;
  value: ValueType;
}

export interface IOpt {
  key: string;
  description: string;
  value_type: ParamTypeOptions;
  is_array: boolean;
}
