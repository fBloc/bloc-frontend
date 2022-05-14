import React, { useCallback, useMemo, useRef } from "react";
import { useQuery } from "react-query";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import dayjs from "dayjs";
import { Drawer, DrawerProps, IconButton, DialogTitle, Divider, CircularProgress } from "@mui/material";
import { getLog } from "@/api/bloc";
import { FaTimes } from "@/components/icons";
import { logAttrs, operationAttrs } from "@/recoil/flow/operation";
import { diffSeconds } from "@/shared/time";
import { getRunningIcon, getRunningStateClass, getRunningStateText, RunningStatusEnum } from "@/shared/enums";

export type BlocLogProps = DrawerProps & {};
const BlocLog: React.FC<BlocLogProps> = ({ className, SlideProps, ...rest }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { onExit, onExited, ...restSlideProps } = SlideProps || {};
  const internalLogAttrs = useRecoilValue(logAttrs);
  const setOperationAttrs = useSetRecoilState(operationAttrs);
  const record = useMemo(() => internalLogAttrs.nodeData?.latestRunningInfo, [internalLogAttrs]);
  const recordId = useMemo(() => record?.recordId || "", [record]);
  const { t } = useTranslation();

  const { data: logData, isFetching } = useQuery(["getRecordLogData", recordId], () => getLog(recordId || ""), {
    enabled: !!recordId && internalLogAttrs.open,
    refetchOnWindowFocus: false,
    refetchInterval: record?.status === RunningStatusEnum.running ? 2000 : false,
    onSuccess: ({ isValid }) => {
      if (isValid) {
        setTimeout(() => {
          if (ref.current) {
            ref.current.scrollTop = 9999;
          }
        }, 0);
      }
    },
  });
  const onInternalExit = useCallback(
    (e: HTMLElement) => {
      onExit?.(e);
      setOperationAttrs((previous) => ({
        ...previous,
        open: false,
      }));
    },
    [onExit, setOperationAttrs],
  );
  const onInternalExited = useCallback(
    (e: HTMLElement) => {
      setOperationAttrs((previous) => ({
        ...previous,
        nodeId: "",
      }));
      onExited?.(e);
    },
    [onExited, setOperationAttrs],
  );
  return (
    <Drawer
      open={internalLogAttrs.open}
      anchor="bottom"
      SlideProps={{
        ...restSlideProps,
        onExit: onInternalExit,
        onExited: onInternalExited,
      }}
      className={classNames("flex items-end z-10", className)}
      {...rest}
    >
      <DialogTitle className="flex items-center justify-between">
        <span>{internalLogAttrs.nodeData?.note || internalLogAttrs.nodeData?.function?.name}</span>
        <IconButton
          sx={{
            ml: "auto",
          }}
          onClick={(e) => {
            onInternalExit(e.currentTarget);
          }}
        >
          <FaTimes className="text-gray-400" size={14} />
        </IconButton>
      </DialogTitle>
      <Divider />
      <div className="p-4">
        <div className="flex items-center">
          <p className={getRunningStateClass(record?.status)}>{getRunningIcon(record?.status, "mr-0.5")}</p>
          <div className="ml-2">
            <p className="font-medium">{getRunningStateText(record?.status)}</p>
            {record?.status && record.status > RunningStatusEnum.running && (
              <p className="mt-1 text-xs text-gray-400">{diffSeconds(record?.startTime, record?.endTime)}</p>
            )}
          </div>
        </div>
        <div className="mt-4 bg-gray-500 rounded-lg p-4 h-96 overflow-auto" ref={ref}>
          {logData?.data?.map((item, index) => (
            <div key={index} className={classNames("px-2 py-1 flex items-center mb-1 text-white", {})}>
              <p
                className={classNames("opacity-90 text-xs whitespace-nowrap font-medium", {
                  "text-yellow-500": item.log_level === "warning",
                  "text-red-400": item.log_level === "error",
                })}
              >
                [{dayjs(item.time).format("YYYY-MM-DD HH:mm:ss")} {item.log_level.toUpperCase()}] [{item.business}]
              </p>
              <p className="ml-2">{item.data}</p>
            </div>
          ))}
          {logData?.data?.length === 0 && <p className="pt-10 text-center text-gray-200">{t("noData")}</p>}
          {isFetching && <CircularProgress sx={{ ml: 1 }} className="!text-white" size={14} />}
        </div>
      </div>
    </Drawer>
  );
};

export default BlocLog;
