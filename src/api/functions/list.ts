import { ParamValueType } from "@/shared/enums";
import request from "@/shared/request";
import { OriginFunctionGroup } from "./originTypes";
import { FunctionItem } from "./types";

function washFunctions(data?: OriginFunctionGroup[] | null): {
  groupName: string;
  functions: FunctionItem[];
}[] {
  return (
    data?.map((item) => ({
      groupName: item.group_name,
      functions: item.functions.map((func) => ({
        ...func,
        provider: func.provider_name,
        lastAliveTime: func.last_alive_time,
        avaliable: Date.now() / 1000 - func.last_alive_time < 60,
        opt: func.opt.map(({ key, description, value_type, is_array }) => ({
          key,
          description,
          valueType: value_type,
          isArray: is_array,
        })),
        ipt: func.ipt.map((item) => ({
          key: item.key,
          description: item.display,
          required: item.must,
          atoms: item.components.map(
            ({ default_value, value_type, formcontrol_type, hint, allow_multi, select_options }) => ({
              description: hint,
              defaultValue: default_value,
              valueType: value_type,
              formType: formcontrol_type,
              isArray: allow_multi, //TODO 修改默认
              selectOptions: select_options,
            }),
          ),
        })),
      })),
    })) || []
  );
}
export function getFunctions() {
  return request.get<OriginFunctionGroup[]>("/api/v1/function").then((res) => ({
    ...res,
    data: washFunctions(res.data),
  }));
}
