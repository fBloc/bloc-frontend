import { useCallback } from "react";
import { useMutation } from "react-query";
import { deleteItem } from "@/api/flow";
import { showConfirm } from "@/components";
import { useRecoilValue } from "recoil";
import { flowDetailState } from "../flow/flow";
import { showToast } from "@/components/toast";
import { useNavigate } from "react-router-dom";
import { PAGES } from "@/router/pages";

export function useDeleteFlow() {
  const deleteFlowMutation = useMutation(deleteItem);
  const flow = useRecoilValue(flowDetailState);
  const navigate = useNavigate();
  const deleteFlow = useCallback(async () => {
    const originId = flow?.originId;
    if (!originId) return;
    const confirmed = await showConfirm({
      title: "确认删除吗？",
      body: "此flow及其运行所产生的历史数据都将被删除。",
    });
    if (confirmed) {
      const { isValid } = await deleteFlowMutation.mutateAsync(originId);
      if (isValid) {
        showToast({
          children: "操作成功",
          autoHideDuration: 1500,
        });
        navigate(PAGES.flowList);
      }
    }
  }, [flow?.originId, deleteFlowMutation, navigate]);
  return deleteFlow;
}
