import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { FullStateAtom, ParamOpt } from "@/api/flow";
import { showConfirm } from "@/components";
import { IptWay } from "@/shared/enums";
import { nodeViewAttrs } from "../flow/board";
import { currentBlocNodeId } from "../flow/node";
import { useQueries } from "./useQueries";
import { useRemoveNode } from "./useRemoveNode";

export function useNodeOperations() {
  const _removeNode = useRemoveNode();
  const { queryNode } = useQueries();
  const setNodeViewerProps = useSetRecoilState(nodeViewAttrs);
  const setCurrenBlocId = useSetRecoilState(currentBlocNodeId);
  const { t } = useTranslation("flow");

  const showNodeViewer = useCallback(
    (nodeId: string) => {
      setNodeViewerProps((previous) => ({
        ...previous,
        open: true,
      }));
      setCurrenBlocId(nodeId);
    },
    [setCurrenBlocId, setNodeViewerProps],
  );
  const removeNode = useCallback(
    async (nodeId: string) => {
      const node = queryNode(nodeId);
      const hasParamIpt =
        (
          node?.paramIpt.reduce((acc: FullStateAtom[], item) => {
            return [...acc, ...item.atoms.filter((atom) => !atom.unset && atom.iptWay === IptWay.Connection)];
          }, []) || []
        ).length > 0;
      const hasParamOpt =
        (
          node?.paramOpt.reduce((acc: ParamOpt["targetList"], param) => {
            return [...acc, ...param.targetList];
          }, []) || []
        ).length > 0;
      const needConfirm = node
        ? hasParamIpt || hasParamOpt || node.voidIpt.length > 0 || node.voidOpt.length > 0
        : false;

      if (needConfirm) {
        const confirmed = await showConfirm({
          title: t("node.confirmDeleteTitle"),
          body: t("node.confirmDeleteBody"),
        });
        if (confirmed) {
          _removeNode(nodeId);
        }
      } else {
        _removeNode(nodeId);
      }
    },
    [_removeNode, queryNode, t],
  );
  return {
    showNodeViewer,
    removeNode,
  };
}
