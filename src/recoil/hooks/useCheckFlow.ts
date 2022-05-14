import { StatefulMergedIptParam } from "@/api/flow";
import { useCallback } from "react";
import { useRecoilValue } from "recoil";
import { blocNodeList } from "../flow/node";

export function useCheckFlow() {
  const nodes = useRecoilValue(blocNodeList);
  /**
   * param是否正确设置
   */
  const isParamsValid = useCallback(() => {
    const result = nodes.reduce((acc: StatefulMergedIptParam[], item) => {
      const params = item.paramIpt.filter((param) => {
        return param.required && param.atoms.filter((atom) => atom.unset).length > 0;
      });
      return [...acc, ...params];
    }, []);
    const isValid = result.length === 0;
    return {
      isValid,
      result,
      message: isValid ? "" : "部分参数未设置",
    };
  }, [nodes]);

  //此处flow指流程，并非业务flwo
  const isFlowValid = useCallback(() => {
    const startNode = nodes.find((item) => item.id === "0");
    const isValid = (startNode?.voidOpt?.length || 0) > 0;
    return {
      isValid,
      message: isValid ? "" : "请将开始节点至少关联至一个流程节点",
    };
  }, [nodes]);
  const isNodesValid = useCallback(() => {
    const isValid = nodes.length > 1;
    return {
      isValid,
      message: isValid ? "" : "至少需要两个节点",
    };
  }, [nodes]);

  const check = useCallback(() => {
    const validations = [isFlowValid, isNodesValid, isParamsValid];
    let error: { isValid: boolean; message: string } | null = null;
    for (const validation of validations) {
      const result = validation();
      if (!result.isValid) {
        error = result;
        break;
      }
    }
    return error;
  }, [isNodesValid, isParamsValid, isFlowValid]);
  return check;
}
