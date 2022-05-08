import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { FlowDetailT } from "@/api/flow";
import { flowDetailState } from "../flow/flow";

export function useUpdateFlow() {
  const setFlowDetail = useSetRecoilState(flowDetailState);
  // const { update } = useUpdateFlow();
  const updateFlow = useCallback(
    async (info: Partial<Omit<FlowDetailT, "id">>) => {
      setFlowDetail((previous) =>
        previous
          ? {
              ...previous,
              ...info,
            }
          : null,
      );
      return true;
    },
    [setFlowDetail],
  );
  return updateFlow;
}
