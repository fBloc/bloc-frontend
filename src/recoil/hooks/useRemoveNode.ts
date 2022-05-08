import { getDefaultEditAtom } from "@/processors";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { blocNodeList } from "../flow/node";

export function useRemoveNode() {
  const setBlocNodeList = useSetRecoilState(blocNodeList);
  const removeNode = useCallback(
    (id: string) => {
      setBlocNodeList((previous) =>
        previous
          .filter((node) => node.id !== id)
          .map((node) => {
            return {
              ...node,
              voidIpt: node.voidIpt.filter((ipt) => ipt !== id),
              voidOpt: node.voidOpt.filter((opt) => opt !== id),
              paramIpt: node.paramIpt.map((ipt) => {
                const atoms = ipt.atoms.map((atom) => {
                  return {
                    ...atom,
                    ...(atom.sourceNode === id ? getDefaultEditAtom(atom) : {}),
                  };
                });
                return {
                  ...ipt,
                  atoms,
                };
              }),
              paramOpt: node.paramOpt.map((opt) => {
                return {
                  ...opt,
                  targetList: opt.targetList.filter((target) => target.nodeId !== id),
                };
              }),
            };
          }),
      );
    },
    [setBlocNodeList],
  );
  return removeNode;
}
