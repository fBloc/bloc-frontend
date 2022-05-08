import { useCallback, useEffect, useRef } from "react";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { blocNodeList } from "../flow/node";
import { FlowDetailT, washbackFlow, updateDraft, updateSettings } from "@/api/flow";
import { flowDetailState, flowState } from "../flow/flow";
import { ReadableOriginBaseFlow } from "@/api/flow/originTypes";

const updateFlow = ({
  is_draft: isDraft,
  ...info
}: Partial<ReadableOriginBaseFlow> & Pick<ReadableOriginBaseFlow, "origin_id" | "id">) => {
  if (isDraft) {
    return updateDraft(info);
  } else {
    return updateSettings(info);
  }
};

export function useSyncFlow() {
  const resetNodes = useResetRecoilState(blocNodeList);
  const flow = useRecoilValue(flowDetailState);
  const setFlowState = useSetRecoilState(flowState);
  const alive = useRef(true);
  const syncFlow = useCallback(
    async (param: Partial<Pick<FlowDetailT, "nodeToBlocMap" | "position" | "name">>) => {
      if (!flow) {
        // TODO 错误完善
        throw new Error("no flow exist");
      }
      const valueLength = Object.values(param).length;
      if (valueLength === 0) {
        throw new Error("params invalid");
      }
      const { originId, id } = flow;
      setFlowState((previous) => ({ ...previous, updating: true }));
      const result = await updateFlow({
        origin_id: originId,
        id,
        is_draft: flow.isDraft,
        ...washbackFlow(param),
      });
      if (alive.current) {
        setFlowState((previous) => ({ ...previous, updating: false }));
      }
      return result;
    },
    [flow, setFlowState],
  );
  useEffect(() => {
    return () => {
      resetNodes();
      alive.current = false;
    };
  }, [resetNodes]);

  return syncFlow;
}
