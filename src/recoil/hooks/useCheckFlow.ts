import { useCallback } from "react";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { uniq } from "lodash-es";
import { StatefulMergedIptParam } from "@/api/flow";
import { isTruthyValue } from "@/shared/tools";
import { blocNodeList } from "../flow/node";

export function useCheckFlow() {
  const nodes = useRecoilValue(blocNodeList);
  const { t } = useTranslation("flow");

  /**
   * param是否正确设置
   */
  const isParamsValid = useCallback(() => {
    const actualNodes = nodes
      .reduce((acc: string[], node) => {
        const paramOpts = node.paramOpt.reduce((acc: string[], param) => {
          return [...acc, ...param.targetList.map((target) => target.nodeId).filter(isTruthyValue)];
        }, []);
        const flowOpts = node.voidOpt;
        return [...acc, ...uniq([...paramOpts, ...flowOpts])];
      }, [])
      .map((item) => nodes.find((node) => node.id === item))
      .filter(isTruthyValue);

    const result = actualNodes.reduce((acc: StatefulMergedIptParam[], item) => {
      const params = item.paramIpt.filter((param) => {
        return param.required && param.atoms.filter((atom) => atom.unset).length > 0;
      });
      return [...acc, ...params];
    }, []);
    const isValid = result.length === 0;
    return {
      isValid,
      result,
      message: isValid ? "" : t("params.unset"),
    };
  }, [nodes, t]);

  //此处flow指流程，并非业务flwo
  const isFlowValid = useCallback(() => {
    const startNode = nodes.find((item) => item.id === "0");
    const isValid = (startNode?.voidOpt?.length || 0) > 0;
    return {
      isValid,
      message: isValid ? "" : t("atLeastOneNode"),
    };
  }, [nodes, t]);

  const check = useCallback(() => {
    const validations = [isFlowValid, isParamsValid];
    let error: { isValid: boolean; message: string } | null = null;
    for (const validation of validations) {
      const result = validation();
      if (!result.isValid) {
        error = result;
        break;
      }
    }
    return error;
  }, [isParamsValid, isFlowValid]);
  return check;
}
