import { useCallback } from "react";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("flow");

  const deleteFlow = useCallback(async () => {
    const originId = flow?.originId;
    if (!originId) return;
    const confirmed = await showConfirm({
      title: t("confirmDeleteTitle"),
      body: t("confirmDeleteBody"),
    });
    if (confirmed) {
      const { isValid } = await deleteFlowMutation.mutateAsync(originId);
      if (isValid) {
        showToast({
          children: t("done"),
          autoHideDuration: 1500,
        });
        navigate(PAGES.flowList);
      }
    }
  }, [flow?.originId, deleteFlowMutation, navigate, t]);
  return deleteFlow;
}
