import React, { useCallback, useMemo } from "react";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";
import classNames from "classnames";
import dayjs from "dayjs";
import { Drawer, DrawerProps, IconButton, DialogTitle, Divider, CircularProgress } from "@mui/material";
import { getLog } from "@/api/bloc";
import { FaTimes } from "@/components/icons";
import { recordLogAttrs } from "@/recoil/flow/record";
import { diffSeconds } from "@/shared/time";
import { getRunningIcon, getRunningStateClass, getRunningStateText, RunningStatusEnum } from "@/shared/enums";

export type BlocLogProps = DrawerProps & {};
const BlocLog: React.FC<BlocLogProps> = ({ className, SlideProps, ...rest }) => {
  const { onExit, onExited, ...restSlideProps } = SlideProps || {};
  const [logAttrs, setLogAttrs] = useRecoilState(recordLogAttrs);
  const recordId = useMemo(() => logAttrs.record?.recordId || "", [logAttrs]);
  const {
    data: logData,
    isLoading,
    isFetching,
  } = useQuery(["getRecordLogData", recordId], () => getLog(recordId || ""), {
    enabled: !!recordId,
    refetchOnWindowFocus: false,
    refetchInterval: logAttrs.record?.status === RunningStatusEnum.running ? 2000 : false,
  });
  const onInternalExit = useCallback(
    (e: HTMLElement) => {
      onExit?.(e);
      setLogAttrs((previous) => ({
        ...previous,
        open: false,
      }));
    },
    [onExit, setLogAttrs],
  );
  const onInternalExited = useCallback(
    (e: HTMLElement) => {
      setLogAttrs((previous) => ({
        ...previous,
        record: null,
        node: null,
      }));
      onExited?.(e);
    },
    [onExited, setLogAttrs],
  );
  return (
    <Drawer
      open={logAttrs.open}
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
        <span>{logAttrs.node?.note || logAttrs.node?.function?.name}</span>
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
          <p className={getRunningStateClass(logAttrs.record?.status)}>
            {getRunningIcon(logAttrs.record?.status, "mr-0.5")}
          </p>
          <div className="ml-2">
            <p className="font-medium">{getRunningStateText(logAttrs.record?.status)}</p>
            {logAttrs.record?.status && logAttrs.record.status > RunningStatusEnum.running && (
              <p className="mt-1 text-xs text-gray-400">
                历时{diffSeconds(logAttrs.record?.startTime, logAttrs.record?.endTime)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 bg-gray-500 rounded-lg p-4 h-96 overflow-auto">
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
          {logData?.data?.length === 0 && <p className="pt-10 text-center text-gray-200">暂无日志</p>}
          {isFetching && <CircularProgress sx={{ ml: 1 }} className="!text-white" size={14} />}
        </div>
      </div>
    </Drawer>
  );
};

export default BlocLog;
