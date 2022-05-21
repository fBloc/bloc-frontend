import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { FaTimes, FaInfoCircle } from "@/components/icons";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { getRunningIcon, getRunningStateClass, getRunningStateText, getTriggerLabel } from "@/shared/enums";
import { formatText } from "@/shared/tools";
import { readableDuration, readableTime } from "@/shared/time";
import { flowDetailState, isLatestRecordState } from "@/recoil/flow/flow";
import { Dialog, DialogTitle, IconButton } from "@mui/material";

// TODO 触发类型未设置
const CurrentState = () => {
  const flow = useRecoilValue(flowDetailState);
  const state = useMemo(() => flow?.latestRun, [flow]);
  const [visible, setVisible] = useState(false);
  const latest = useRecoilValue(isLatestRecordState);
  const { t } = useTranslation("flow");

  const close = useCallback(() => {
    setVisible(false);
  }, []);
  return (
    <>
      <IconButton
        onClick={() => {
          setVisible(true);
        }}
      >
        <FaInfoCircle size={16} />
      </IconButton>
      <Dialog open={visible} maxWidth="xs" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span>{t("run.runningInfo")}</span>

          <IconButton onClick={close}>
            <FaTimes size={14} />
          </IconButton>
        </DialogTitle>
        <div className="px-6 pb-6">
          <p className="flex justify-between">
            <span className="bloc-description flex items-center">
              {t("status", {
                ns: "common",
              })}
              <span className={classNames("text-xs bg-gray-100 py-0.5 px-2 rounded-lg m-1", latest ? "" : "invisible")}>
                {t("latest", {
                  ns: "common",
                })}
              </span>
            </span>
            <span
              className={classNames(
                getRunningStateClass(state?.status, {
                  text: true,
                }),
                "flex items-center font-medium",
              )}
            >
              {getRunningIcon(state?.status, {
                className: "mr-0.5",
              })}
              <span className="ml-1">{formatText(getRunningStateText(state?.status))}</span>
            </span>
          </p>
          {((state?.canceled && state?.cancel_user_name) || state?.timeout_canceled) && (
            <p className="mt-2 bg-red-50 px-2 py-1 rounded text-red-400">
              {state.cancel_user_name ? (
                <>
                  {t("status.canceledByUser", {
                    userName: state.cancel_user_name,
                  })}
                </>
              ) : (
                t("status.timeoutCanceled")
              )}
            </p>
          )}

          {state?.error_msg && (
            <p className="mt-2 flex justify-between items-center">
              <span className="mr-4 bloc-description flex-shrink-0">{t("errorMessage")}</span>
              <span className="text-red-400 break-all">{state?.error_msg}</span>
            </p>
          )}

          {state?.retried_amount ? (
            <p className="mt-2 flex justify-between items-center">
              <span className="bloc-description">{t("run.retryTimes")}</span>
              <span>{state?.retried_amount}</span>
            </p>
          ) : null}
          <p className="mt-2 flex justify-between items-center">
            <span className="bloc-description">{t("run.startRunAt")}</span>
            <span>{readableTime(state?.start_time)}</span>
          </p>
          <p className="mt-2 flex justify-between items-center">
            <span className="bloc-description">{t("run.endRunAt")}</span>
            <span>{readableTime(state?.end_time)}</span>
          </p>
          {state?.start_time && state.end_time && (
            <p className="mt-2 flex justify-between items-center">
              <span className="bloc-description">{t("run.duration")}</span>
              <span>{readableDuration(state?.start_time, state?.end_time)}</span>
            </p>
          )}
          <hr className="my-4" />
          <p className="flex justify-between items-center">
            <span className="bloc-description">{t("run.triggerType")}</span>
            <span>{getTriggerLabel(state?.trigger_type)}</span>
          </p>
          {state?.trigger_key && (
            <p className="mt-2 flex justify-between items-center">
              <span className="bloc-description">{t("run.triggerKey")}</span>
              <span className="max-w-[150px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                {state?.trigger_key}
              </span>
            </p>
          )}
          {state?.trigger_time && (
            <p className="mt-2 flex justify-between items-center">
              <span className="bloc-description">{t("run.triggerAt")}</span>
              <span>{readableTime(state?.trigger_time)}</span>
            </p>
          )}
          {state?.trigger_user_name && (
            <p className="mt-2 flex justify-between items-center">
              <span className="bloc-description">{t("run.triggerUser")}</span>
              <span>{state?.trigger_user_name}</span>
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
};
export default CurrentState;
