import { useRecoilCallback } from "recoil";
import { atomEditState, AtomKey } from "../flow/node";
import { valueEqualsUnset } from "@/processors/value";
import { getDefaultEditAtom } from "@/processors";

/**
 * 设置atom value
 */
export function useSetAtomValue() {
  const setAtomValue = useRecoilCallback(({ set }) => {
    return (atomKey: AtomKey, value: unknown, reset = false) => {
      set(atomEditState(atomKey), (previous) => {
        const result = {
          ...previous,
          value,
          unset: valueEqualsUnset({
            ...previous,
            value,
          }),
        };
        return {
          ...result,
          ...(reset ? getDefaultEditAtom(result) : {}),
        };
      });
    };
  });
  // const setAtomValue = useCallback(
  //   (value: unknown, reset = false) => {
  //     setCurrentAtom((previous) => {
  //       const result = {
  //         ...previous,
  //         value,
  //         unset: valueEqualsUnset({
  //           ...previous,
  //           value,
  //         }),
  //       };
  //       return {
  //         ...result,
  //         ...(reset ? getDefaultEditAtom(result) : {}),
  //       };
  //     });
  //   },
  //   [setCurrentAtom],
  // );
  return setAtomValue;
}
