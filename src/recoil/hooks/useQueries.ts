import { useCallback } from "react";
import { useRecoilValue } from "recoil";
import { BlocNodeItem } from "@/shared/types";
import { blocNodeList } from "../flow/node";

export function useQueries() {
  const nodeList = useRecoilValue(blocNodeList);
  const queryNode = useCallback(
    (nodeId = "") => {
      return nodeList.find((node) => node.id === nodeId);
    },
    [nodeList],
  );
  const querySourceParam = useCallback((node: BlocNodeItem | null, sourceParam = "") => {
    return node?.paramOpt.find((param) => param.key === sourceParam);
  }, []);
  const queryTargetAtom = useCallback((node: BlocNodeItem | null, targetParam = "", atomIndex = -1) => {
    return node?.paramIpt.find((param) => param.key === targetParam)?.atoms[atomIndex];
  }, []);
  return {
    queryNode,
    querySourceParam,
    queryTargetAtom,
  };
}
