import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { TabPanel } from "@/components";
import classNames from "classnames";
import { getBlocRecordDetail, ResultPreview } from "@/api/flow";
import { getRunningIcon, getRunningStateClass, getRunningStateText, RunningStatusEnum } from "@/shared/enums";
import { FaTimes } from "@/components/icons";
import { diffSeconds, readableTime } from "@/shared/time";
import { operationAttrs, resultAttrs } from "@/recoil/flow/operation";
import { Dialog, DialogTitle, IconButton, Divider, Tabs, Tab, DialogProps } from "@mui/material";

type DataZoneProps = React.HTMLAttributes<HTMLDivElement> & {
  preview?: ResultPreview;
};
const DataZone: React.FC<DataZoneProps> = ({ preview, className, children, ...rest }) => {
  const data = useMemo(() => preview?.brief.replace(/^"/g, ""), [preview?.brief]);
  const { t } = useTranslation();

  return (
    <div className={classNames("bg-gray-100 px-4 p-4 rounded-lg relative group min-h-[90px]", className)} {...rest}>
      <p className="break-all multiple-line-ellipsis line-count-3">
        {data || <span className="bloc-description">{t("noData")}</span>}
      </p>
      {preview?.object_storage_key && (
        <div
          className="flex justify-end bg-gray-50 absolute bottom-0 left-0 w-full rounded-b-xl py-1.5 invisible group-hover:visible px-2"
          style={{
            boxShadow: "0 -1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <Link to={`/result/${preview?.object_storage_key || ""}`} target="_blank">
            <button className="text-xs py-1 px-2 text-primary-400 hover:bg-gray-100 rounded font-medium">
              {t("viewAll")}
            </button>
          </Link>
        </div>
      )}
      {children}
    </div>
  );
};

const BlocReresult: React.FC<Omit<DialogProps, "open">> = ({ TransitionProps, ...rest }) => {
  const { onExited, onExit, ...restTransitionProps } = TransitionProps || {};
  const attrs = useRecoilValue(resultAttrs);
  const setOperationAttrs = useSetRecoilState(operationAttrs);
  const currentFunction = useMemo(() => attrs.nodeData?.function, [attrs]);
  const [type, setType] = useState<"input" | "output">("input");
  const recordId = useMemo(() => attrs.nodeData?.latestRunningInfo?.recordId, [attrs]);
  const { t } = useTranslation();

  const { data } = useQuery(["getBlocResult", recordId], () => getBlocRecordDetail(recordId || ""), {
    refetchOnWindowFocus: false,
    enabled: !!recordId && attrs.open,
  });
  const resultDetail = useMemo(() => data?.data, [data]);
  const stateCode = useMemo(() => attrs.nodeData?.latestRunningInfo?.status, [attrs]);
  const onInternalExit = useCallback(
    (e: HTMLElement) => {
      onExit?.(e);
      setOperationAttrs((previous) => ({
        ...previous,
        open: false,
      }));
    },
    [setOperationAttrs, onExit],
  );
  const onInternalExited = useCallback(
    (e: HTMLElement) => {
      onExited?.(e);
      setType("input");
      setOperationAttrs((previous) => ({
        ...previous,
        nodeId: "",
      }));
    },
    [onExited, setOperationAttrs],
  );
  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={attrs.open}
      TransitionProps={{
        onExited: onInternalExited,
        onExit: onInternalExit,
        ...restTransitionProps,
      }}
      {...rest}
    >
      <DialogTitle className="flex justify-between">
        <span></span>
        <IconButton
          onClick={(e) => {
            onInternalExit(e.currentTarget);
          }}
        >
          <FaTimes size={14} />
        </IconButton>
      </DialogTitle>
      <div className="px-6 pb-6 flex">
        <div>
          <div
            className={classNames(
              getRunningStateClass(stateCode, {
                text: true,
              }),
              "flex items-center mr-4",
            )}
          >
            {getRunningIcon(stateCode, "mr-0.5")}
            <div className="ml-2">
              <p className="font-medium">{getRunningStateText(stateCode)}</p>

              {resultDetail?.errorMsg && <p className="text-xs mt-1">{resultDetail?.errorMsg}</p>}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-400 text-xs">{t("triggerTime")}</p>
            <p>{readableTime(resultDetail?.trigger)}</p>
          </div>
          <div className="my-4">
            <p className="text-gray-400 text-xs">{t("startRunAt")}</p>
            <p>{readableTime(resultDetail?.start)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">{t("endRunAt")}</p>
            <p>{readableTime(resultDetail?.end)}</p>
          </div>
          <div className="my-4">
            <p className="text-gray-400 text-xs">{t("duration")}</p>
            <p>{diffSeconds(resultDetail?.start, resultDetail?.end)}</p>
          </div>
        </div>
        <Divider orientation="vertical" sx={{ mx: 4, alignSelf: "stretch" }} />
        <div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium">{currentFunction?.name}</p>
              <p className="mt-1 mb-2 text-sm">{attrs.nodeData?.note}</p>
            </div>
          </div>
          <Tabs
            value={type}
            onChange={(_, v) => {
              setType(v);
            }}
          >
            <Tab label={t("input")} value="input" />
            <Tab label={t("output")} value="output" />
          </Tabs>
          <TabPanel index="input" value={type}>
            {currentFunction?.ipt.map((ipt, iptIndex) => (
              <div key={ipt.key} className="mt-6">
                <div>
                  <p>{ipt.description}</p>
                  <p className="font-mono text-gray-400 text-xs">{ipt.key}</p>
                </div>
                <div className="mt-2 flex">
                  {ipt.atoms.map((_, atomIndex) => (
                    <DataZone
                      key={atomIndex}
                      preview={resultDetail?.ipt?.[iptIndex]?.[atomIndex]}
                      className="mr-4 w-[300px] min-h-[90px]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabPanel>
          <TabPanel index="output" value={type}>
            <>
              {currentFunction?.opt.length === 0 ? (
                <p className="p-10 bg-gray-50 rounded-lg text-center text-gray-400">{t("noOutputParams")}</p>
              ) : (
                <>
                  {stateCode === RunningStatusEnum.running && (
                    <p
                      className={classNames(
                        getRunningStateClass(stateCode, { border: true, bg: true }),
                        "inline-block mt-4 border px-2 py-1 rounded",
                      )}
                    >
                      {t("noDataWhileRunning")}
                    </p>
                  )}
                  {currentFunction?.opt.map((opt) => (
                    <div key={opt.key} className="mt-6 w-[300px] min-h-[90px]">
                      <p className="mb-0.5">{opt.description || t("noDescription")}</p>
                      <p className="font-mono bloc-description">{opt.key}</p>
                      <DataZone preview={resultDetail?.opt?.[opt.key]} className="mt-2" />
                    </div>
                  ))}
                </>
              )}
            </>
          </TabPanel>
        </div>
      </div>
    </Dialog>
  );
};
export default BlocReresult;
