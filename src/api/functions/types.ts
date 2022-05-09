import { FormControlType, ParamValueType } from "@/shared/enums";
import { TruthyValue, ValueType } from "@/shared/types";

export interface IptParam {
  key: string;
  description: string;
  required: boolean;
  atoms: FnAtom[];
}

export interface OptParam {
  key: string;
  description: string;
  valueType: ParamValueType;
  isArray: boolean;
}

export interface FunctionGroup {
  groupName: string;
  functions: FunctionItem[];
}

export interface FunctionItem {
  id: string;
  name: string;
  description: string;
  ipt: IptParam[];
  opt: OptParam[];
  /**
   * 提供者
   */
  provider: string;
  /**
   * 上次心跳时间
   */
  lastAliveTime: number;
  avaliable: boolean;
}

export interface SelectOption {
  label: string | number;
  value: TruthyValue;
}

export interface FnAtom {
  /**
   * 描述信息
   */
  description: string;
  /**
   * 默认值
   */
  defaultValue: ValueType;
  /**
   * 值类型
   */
  valueType: ParamValueType;
  /**
   * 表单输入形式
   */
  formType: FormControlType;
  /**
   * 是否是数组
   */
  isArray: boolean;
  /**
   * 选项列表：仅当输入类型为选择器时可用
   */
  selectOptions: SelectOption[] | null;
}
