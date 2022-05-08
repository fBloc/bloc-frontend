import React, { useMemo } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { Button, Dialog } from "@/components";
import { beingRemovedConnectionAttrs } from "@/recoil/flow/connections";
import { useQueries } from "@/recoil/hooks/useQueries";
import { isTruthyValue } from "@/shared/tools";
import { useRemoveConnection } from "@/recoil/hooks/useRemoveConnection";
import { TextFallback } from "@/shared/jsxUtils";

const RemoveConnection = () => {
  const [attrs, setAttrs] = useRecoilState(beingRemovedConnectionAttrs);
  const resetAttrs = useResetRecoilState(beingRemovedConnectionAttrs);
  const { queryNode, queryTargetAtom } = useQueries();
  const removeConnection = useRemoveConnection();
  const targeAtoms = useMemo(() => {
    if (!attrs.connection) return [];
    const { targetNode, targetParam, targetAtomIndex = [] } = attrs.connection;
    const node = queryNode(targetNode);
    if (!node) {
      // TODO error
      return [];
    }
    return targetAtomIndex.map((item) => queryTargetAtom(node, targetParam, item)).filter(isTruthyValue);
  }, [attrs, queryNode, queryTargetAtom]);
  return (
    <Dialog
      open={attrs.open}
      size="sm"
      onExit={() => {
        setAttrs((previous) => ({
          ...previous,
          open: false,
        }));
      }}
      onExited={resetAttrs}
    >
      <p className="text-lg text-center font-medium">选择要取消关联的子项</p>
      <p className="mt-1 text-center text-gray-400">目标参数关联了{attrs.connection?.targetAtomIndex?.length}个子项</p>
      <div className="my-6 ">
        {targeAtoms.map((atom) => (
          <p
            key={atom.atomIndex}
            className="mt-3 p-3 border border-solid rounded-md flex items-center justify-between group"
          >
            {TextFallback(atom.description, "暂无描述")}
            <Button
              className="ml-2"
              size="small"
              onClick={() => {
                if (!attrs.connection) return;
                removeConnection({
                  ...attrs.connection,
                  targetAtomIndex: atom.atomIndex,
                });
                setAttrs((previous) => ({
                  ...previous,
                  open: false,
                }));
              }}
            >
              取消关联
            </Button>
          </p>
        ))}
      </div>
      {/* <Button block className="invisibles group-hover:visible flex mx-auto items-center justify-center" intent="danger">
        取消关联
      </Button> */}
    </Dialog>
  );
};

export default RemoveConnection;
