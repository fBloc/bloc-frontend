import { useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { blocId } from "@/shared/tools";
import { BlocNodeItem, Position, Viewport } from "@/shared/types";
import { flatFunctionState } from "../functions";
import { getDefaultEditAtom, mergeIpts } from "@/processors";
import { DEFAULT_POSITION } from "@/shared/defaults";
import { blocNodeList } from "../flow/node";
import { flowDetailState } from "../flow/flow";

/**
 * 去除画板位置因素影响，计算实际位置
 */
function calculatePosition(nodePosition: Position, boardPosition: Viewport) {
  return {
    left: (nodePosition.left - boardPosition.left) / boardPosition.zoom,
    top: (nodePosition.top - boardPosition.top) / boardPosition.zoom,
  };
}

export function useAddNode() {
  const setBlocNodeList = useSetRecoilState(blocNodeList);
  const functions = useRecoilValue(flatFunctionState);
  const { position: boardPosition } = useRecoilValue(flowDetailState) || { position: DEFAULT_POSITION };
  const { left = 0, top = 0, zoom = 1 } = boardPosition || DEFAULT_POSITION;

  const addNode = useCallback(
    (functionId: string, { note, ...conf }: Pick<BlocNodeItem, "note" | "position">) => {
      const bId = blocId();
      const fn = functions.find((fn) => fn.id === functionId) || null;
      setBlocNodeList((previous) => [
        ...previous,
        {
          id: bId,
          position: calculatePosition(conf.position, { left, top, zoom }),
          function: fn,
          note: note.trim(),
          paramIpt: mergeIpts(fn?.ipt.map((param) => param.atoms.map(getDefaultEditAtom)) || [], fn, bId),
          voidIpt: [],
          voidOpt: [],
          paramOpt:
            fn?.opt.map((param) => {
              return {
                ...param,
                nodeId: bId,
                param: param.key,
                targetList: [],
              };
            }) || [],
          latestRunningInfo: null,
        },
      ]);
    },
    [setBlocNodeList, functions, left, top, zoom],
  );
  return { addNode };
}
