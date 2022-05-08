import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { Overlay, Slide, TabPanel, TransitionProps } from "@/components";
import { CmdComponentProps, createCmdComponent } from "@/shared/createCmdComponent";
import classNames from "classnames";
import { getBlocRecordDetail, ResultPreview } from "@/api/flow";
import { getRunningIcon, getRunningStateClass, getRunningStateText, RunningStatusEnum } from "@/shared/enums";
import { FaTimes } from "@/components/icons";
import { diffSeconds, readableTime } from "@/shared/time";
import { recordAttrs } from "@/recoil/flow/record";
import { Dialog, DialogTitle, IconButton, Divider, Tabs, Tab, DialogProps } from "@mui/material";
export type BlocRecordProps = DialogProps;

type DataZoneProps = React.HTMLAttributes<HTMLDivElement> & {
  preview?: ResultPreview;
};
const DataZone: React.FC<DataZoneProps> = ({ preview, className, children, ...rest }) => {
  const data = useMemo(() => preview?.brief.replace(/^"/g, ""), [preview?.brief]);
  return (
    <div className={classNames("bg-gray-100 px-4 p-4 rounded-lg relative group min-h-[90px]", className)} {...rest}>
      <p className="break-all multiple-line-ellipsis line-count-3">
        {data || <span className="bloc-description">预览数据为空</span>}
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
              全部数据
            </button>
          </Link>
        </div>
      )}
      {children}
    </div>
  );
};

const BlocRecord: React.FC<BlocRecordProps> = ({ open, className, TransitionProps, ...rest }) => {
  const { onExited, onExit, ...restTransitionProps } = TransitionProps || {};
  const attrs = useRecoilValue(recordAttrs);
  const currentFunction = useMemo(() => attrs.nodeData?.function, [attrs]);
  const [type, setType] = useState<"input" | "output">("input");
  const recordId = useMemo(() => attrs.nodeData?.latestRunningInfo?.recordId, [attrs]);
  const { data } = useQuery(["getBlocRecordDetail", recordId], () => getBlocRecordDetail(recordId || ""), {
    refetchOnWindowFocus: false,
    enabled: !!recordId,
  });
  const record = useMemo(() => data?.data, [data]);
  const stateCode = useMemo(() => attrs.nodeData?.latestRunningInfo?.status, [attrs]);

  const onFullExited = useCallback(
    (e: HTMLElement) => {
      onExited?.(e);
      setType("input");
    },
    [onExited],
  );
  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={open ?? false}
      TransitionProps={{
        onExited: onFullExited,
        onExit,
        ...restTransitionProps,
      }}
      {...rest}
    >
      <DialogTitle className="flex justify-between">
        <span></span>
        <IconButton
          onClick={(e) => {
            onExit?.(e.currentTarget);
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

              {record?.errorMsg && <p className="text-xs mt-1">{record?.errorMsg}</p>}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-400 text-xs">触发时间</p>
            <p>{readableTime(record?.trigger)}</p>
          </div>
          <div className="my-4">
            <p className="text-gray-400 text-xs">开始运行时间</p>
            <p>{readableTime(record?.start)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">结束运行时间</p>
            <p>{readableTime(record?.end)}</p>
          </div>
          <div className="my-4">
            <p className="text-gray-400 text-xs">历时</p>
            <p>{diffSeconds(record?.start, record?.end)}</p>
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
            <Tab label="输入" value="input" />
            <Tab label="输出" value="output" />
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
                      preview={record?.ipt?.[iptIndex]?.[atomIndex]}
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
                <p className="p-10 bg-gray-50 rounded-lg text-center text-gray-400">无输出参数</p>
              ) : (
                <>
                  {stateCode === RunningStatusEnum.running && (
                    <p
                      className={classNames(
                        getRunningStateClass(stateCode, { border: true, bg: true }),
                        "inline-block mt-4 border px-2 py-1 rounded",
                      )}
                    >
                      当前节点正在运行中，暂未产生输出数据
                    </p>
                  )}
                  {currentFunction?.opt.map((opt) => (
                    <div key={opt.key} className="mt-6 w-[300px] min-h-[90px]">
                      <p className="mb-0.5">{opt.description || "暂无描述"}</p>
                      <p className="font-mono bloc-description">{opt.key}</p>
                      <DataZone preview={record?.opt?.[opt.key]} className="mt-2" />
                    </div>
                  ))}
                </>
              )}
            </>
          </TabPanel>
        </div>
        {/* <div className="mx-6 w-96 bg-gray-600 rounded-lg h-full"></div> */}
      </div>
    </Dialog>
  );
};
export default BlocRecord;
export const showRecord = createCmdComponent(BlocRecord, false);
