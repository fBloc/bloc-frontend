import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { FlowDetailT, updateDraft, updateSettings, washbackFlow } from "@/api/flow";
import { flowDetailState } from "../flow/flow";
import { ReadableOriginBaseFlow } from "@/api/flow/originTypes";

const updateFlows = ({
  is_draft: isDraft,
  ...info
}: Partial<ReadableOriginBaseFlow> & Pick<ReadableOriginBaseFlow, "origin_id" | "id">) => {
  if (isDraft) {
    return updateDraft(info);
  } else {
    return updateSettings(info);
  }
};

export function useUpdateFlow() {
  const [flow, setFlowDetail] = useRecoilState(flowDetailState);
  const updateFlow = useCallback(
    async (info: Partial<Omit<FlowDetailT, "id">>) => {
      const { isValid } = await updateFlows({
        origin_id: flow?.originId ?? "",
        id: flow?.id ?? "",
        is_draft: flow?.isDraft ?? false,

        ...washbackFlow({
          ...info,
        }),
      });
      if (isValid) {
        setFlowDetail((previous) =>
          previous
            ? {
                ...previous,
                ...info,
              }
            : null,
        );
      }

      return isValid;
    },
    [setFlowDetail, flow],
  );
  return updateFlow;
}
