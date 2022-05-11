import { FullStateAtom, ParamOpt } from "@/api/flow";
import { FormControlType, IptWay, ParamValueType } from "./enums";
import { ParamConnectionEnd } from "./types";

export const DEFAULT_POSITION = {
  left: 0,
  top: 0,
  zoom: 1,
};

/**
 * 默认的atom描述数据
 */
export const DEFAULT_EDIT_ATOM_DESCCRIPTOR: FullStateAtom = {
  valueType: ParamValueType.string,
  formType: FormControlType.input,
  description: "",
  isArray: false,
  selectOptions: [],
  defaultValue: null,
  unset: true,
  iptWay: IptWay.UserIpt,
  value: null,
  sourceNode: "",
  sourceParam: "",
  nodeId: "",
  parentParam: "",
  atomIndex: -1,
  readableValue: "",
};

export const DEFAULT_SOURCE_PARAM: ParamOpt = {
  isArray: false,
  valueType: ParamValueType.string,
  nodeId: "",
  key: "",
  description: "",
  targetList: [],
};

export const DEFAULT_CONNECTION_END: ParamConnectionEnd = {
  nodeId: "",
  param: "",
};
