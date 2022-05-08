import { useSetRecoilState } from "recoil";
import { useCallback } from "react";
import { BlocNodeItem } from "@/shared/types";
import { blocNodeList } from "../flow/node";

export function useUpdateBlocNode() {
  const setBlocNodeList = useSetRecoilState(blocNodeList);
  const updateBlocNode = useCallback(
    (nodeId: string, payload: Partial<BlocNodeItem>) => {
      setBlocNodeList((previous) => {
        return previous.map((node) => {
          return node.id === nodeId
            ? {
                ...node,
                ...payload,
              }
            : node;
        });
      });
    },
    [setBlocNodeList],
  );
  return updateBlocNode;
}
