import { FormControlType, ParamValueType } from "@/shared/enums";
import { ValueType } from "@/shared/types";
import { SelectOption } from "./types";

export interface OriginFunctionGroup {
  functions: OriginFunctionItem[];
  group_name: string;
}

export type OriginFunctionItem = {
  id: string;
  name: string;
  description: string;
  ipt: OriginIptParam[];
  opt: OriginOptParam[];
  provider_name: string;
  last_alive_time: number;
};

export interface OriginAtomT {
  value_type: ParamValueType;
  formcontrol_type: FormControlType;
  hint: string;
  default_value: ValueType;
  allow_multi: boolean;
  select_options: SelectOption[] | null;
}

export interface OriginIptParam {
  key: string;
  display: string;
  must: boolean;
  components: OriginAtomT[];
}

export interface OriginOptParam {
  key: string;
  description: string;
  value_type: ParamValueType;
  is_array: boolean;
}
