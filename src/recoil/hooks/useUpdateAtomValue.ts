import { useCallback } from "react";
import { useRecoilValue, useRecoilCallback, useRecoilState } from "recoil";
import { atomEditState, AtomKey, blocNodeList, currentBlocNode } from "../flow/node";
import { operationRecords } from "../flow/param";
import { addConnection, removeConnection } from "@/processors/connections";
import { BlocNodeItem } from "@/shared/types";
import { IptWay } from "@/shared/enums";
import { FullStateAtom } from "@/api/flow";

export function useUpdateAtomValue() {
  const [nodes, setBlocNodeList] = useRecoilState(blocNodeList);
  const blocNode = useRecoilValue(currentBlocNode);
  // const records = useRecoilValue(operationRecords);
  const fetchEditValue = useRecoilCallback(
    ({ snapshot }) =>
      (key: AtomKey) => {
        return snapshot.getPromise(atomEditState(key));
      },
    [],
  );
  const getRecords = useRecoilCallback(({ snapshot }) => {
    return () => {
      return snapshot.getPromise(operationRecords);
    };
  });
  const excuteRecords = useCallback(
    async (nodes: BlocNodeItem[]) => {
      const records = await getRecords();
      let newerNodes = [...nodes];
      records.forEach(({ source, target, type, isFlow }) => {
        const connection = {
          sourceNode: source.nodeId,
          sourceParam: source.param,
          targetNode: target.nodeId,
          targetParam: target.param,
          targetAtomIndex: target.atomIndex ?? -1,
          isFlow,
        };
        if (type === "connect") {
          newerNodes = addConnection(newerNodes, connection);
        }
        if (type === "disconnect") {
          newerNodes = removeConnection(newerNodes, connection);
        }
      });
      return newerNodes;
    },
    [getRecords],
  );
  const updateAtomValue = useCallback(async () => {
    const result = new Map<AtomKey, FullStateAtom>();
    const promiseFetchValue =
      blocNode?.paramIpt.reduce((acc: Promise<FullStateAtom>[], param) => {
        return [
          ...acc,
          ...param.atoms.map(async (atom, atomIndex) => {
            let _atom = atom;
            const key: AtomKey = `${blocNode.id}_${param.key}_${atomIndex}`;
            if (atom.iptWay === IptWay.UserIpt) {
              const value = await fetchEditValue(key);
              _atom = value;
            }
            result.set(key, _atom);
            return _atom;
          }),
        ];
      }, []) || [];
    await Promise.all(promiseFetchValue);
    let newerNodes = nodes.map((node) => {
      if (node.id === blocNode?.id)
        return {
          ...node,
          paramIpt: node.paramIpt.map((param) => {
            return {
              ...param,
              atoms: param.atoms.map((atom, atomIndex) => {
                if (atom.iptWay === IptWay.UserIpt) {
                  const key: AtomKey = `${blocNode.id}_${param.key}_${atomIndex}`;
                  return result.get(key) || atom;
                }
                return atom;
              }),
            };
          }),
        };
      return node;
    });
    newerNodes = await excuteRecords(newerNodes);
    setBlocNodeList(newerNodes);
  }, [blocNode, fetchEditValue, excuteRecords, nodes, setBlocNodeList]);
  return updateAtomValue;
}
