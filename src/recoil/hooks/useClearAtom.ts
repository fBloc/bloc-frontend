/**
 * 保存更新的参数后，重设参数设置
 */

import { useCallback } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { atomEditState, AtomKey, currentBlocNode } from "../flow/node";

export function useClearAtom() {
  const clearAtom = useRecoilCallback(({ reset }) => {
    return (key: AtomKey) => {
      reset(atomEditState(key));
    };
  });
  return {
    clearAtom,
  };
}

export function useClearAllAtoms() {
  const blocNode = useRecoilValue(currentBlocNode);
  const { clearAtom } = useClearAtom();
  const clearAllAtoms = useCallback(() => {
    const atomKeyList =
      blocNode?.paramIpt.reduce((acc: AtomKey[], param) => {
        const result = param.atoms.map((_, atomIndex) => `${blocNode.id}_${param.key}_${atomIndex}` as AtomKey);
        return [...acc, ...result];
      }, []) || [];
    atomKeyList.forEach((key) => {
      clearAtom(key);
    });
  }, [clearAtom, blocNode]);
  return clearAllAtoms;
}
