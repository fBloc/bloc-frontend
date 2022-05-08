import { useCallback } from "react";
import { Position } from "@/shared/types";
import { useUpdateBlocNode } from "./useUpdateBlocNode";

export function useUpdateNodePosition() {
  const updateBlocNode = useUpdateBlocNode();
  const updateNodePosition = useCallback(
    (nodeId: string, position: Position) => {
      updateBlocNode(nodeId, {
        position,
      });
    },
    [updateBlocNode],
  );
  return updateNodePosition;
}
