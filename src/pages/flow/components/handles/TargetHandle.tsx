import React, { useMemo, useState } from "react";
import { Handle, Position } from "react-flow-renderer";
import classNames from "classnames";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";
import { Popover, Divider } from "@mui/material";
import { Tooltip } from "@/components";
import { getBlocRecordDetail, StatefulMergedIptParam } from "@/api/flow";
import { BLOC_FLOW_HANDLE_ID } from "@/shared/constants";
import { FlowDisplayPage, IptWay, MergedIptParamStatus } from "@/shared/enums";
import { TextFallback } from "@/shared/jsxUtils";
import { BlocNodeData, Connectable } from "@/shared/types";
import { FaExclamationCircle, FaCheckCircle } from "@/components/icons";
import { runningRecord } from "@/recoil/flow/node";
import styles from "../handles/handle.module.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
const percentage = (value: number) => {
  return `${Math.round(value * 100)}%`;
};

const getIptWayText = (iptway: IptWay) => {
  const texts = {
    [IptWay.UserIpt]: "用户输入",
    [IptWay.Connection]: "关联",
  };
  return texts[iptway];
};
const TargetHandle: React.FC<{ detail: StatefulMergedIptParam; nodeData: BlocNodeData } & Connectable> = ({
  detail,
  nodeData,
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const recordId = useMemo(() => nodeData.latestRunningInfo?.recordId || "", [nodeData]);
  const [recordDetail, setRecorDetail] = useRecoilState(runningRecord(recordId || ""));
  const { isLoading } = useQuery(["getRunningDetail", recordId], () => getBlocRecordDetail(recordId), {
    enabled: !recordDetail && !!recordId && anchor !== null,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data.data) {
        setRecorDetail(data.data);
      }
    },
  });
  const atoms = useMemo(() => {
    return recordDetail?.ipt?.[detail.index] || [];
  }, [detail.index, recordDetail]);
  const readFlowMode = useMemo(() => [FlowDisplayPage.flow, FlowDisplayPage.draft].includes(nodeData.mode), [nodeData]);

  return (
    <>
      <div
        className={classNames("relative mx-2 grxoup rounded-full", anchor !== null ? "scale-150 shadow" : "")}
        onClick={(e) => {
          setAnchor(e.currentTarget);
        }}
        onMouseEnter={(e) => {
          if (readFlowMode) {
            setAnchor(e.currentTarget);
          }
        }}
        onMouseLeave={() => {
          if (readFlowMode) {
            setAnchor(null);
          }
        }}
      >
        <Tooltip
          title={
            [FlowDisplayPage.preview, FlowDisplayPage.history].includes(nodeData.mode) ? "点击查看数据详情" : false
          }
        >
          <Handle
            isConnectable={false}
            type="target"
            id={detail.key}
            position={Position.Top}
            className={classNames(
              styles["target-handle"],
              detail.status === MergedIptParamStatus.avaliable ? "!border-green-300" : "",
              detail.status === MergedIptParamStatus.indeterminate ? "!border-yellow-300" : "",
              detail.status === MergedIptParamStatus.unavaliable
                ? "!bg-gray-100 !border-gray-100 hover:!border-red-400"
                : "",
              "hover:!border-gray-400",
            )}
          />
        </Tooltip>
        {nodeData.isConnecting ? (
          <div
            className={classNames(
              "w-2.5 h-2.5 absolute left-0 top-0 rounded-full pointer-events-none",
              detail.status === MergedIptParamStatus.avaliable ? "bg-green-300" : "",
              detail.status === MergedIptParamStatus.indeterminate ? "bg-yellow-300" : "",
              detail.status === MergedIptParamStatus.unavaliable ? "bg-gray-200" : "",
            )}
          ></div>
        ) : (
          <div className="w-2.5 h-2.5 absolute left-0 top-0 border border-solid border-gray-200 rounded-full pointer-events-none">
            <CircularProgressbar
              value={detail.progress * 100}
              strokeWidth={50}
              backgroundPadding={0}
              background
              styles={{
                background: {
                  backgroundColor: "red",
                  background: "blue",
                },
                path: {
                  strokeLinecap: "butt",
                  stroke: "#4ade80",
                },
                trail: {
                  stroke: "white",
                },
              }}
            />
          </div>
        )}
      </div>
      <Popover
        disableRestoreFocus
        open={!!anchor}
        anchorEl={anchor}
        sx={
          readFlowMode
            ? {
                pointerEvents: "none",
              }
            : {}
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        onClose={() => {
          setAnchor(null);
        }}
      >
        <div className="w-60 p-3">
          {nodeData.mode === FlowDisplayPage.draft && (
            <>
              {/* <div className="text-gray-400">
                <span>已完成: {percentage(detail.progress)}</span>
              </div>
              <Divider sx={{ my: 2 }} /> */}
              <p>{TextFallback(detail.description, "缺少描述")}</p>
              <p className="text-xs text-gray-400">{detail.key}</p>
              <Divider sx={{ my: 2 }} />

              <ul>
                {detail.atoms?.map((atom, i) => (
                  <li key={i} className="mt-2">
                    <div className="text-xs text-gray-400">
                      {i + 1}. {TextFallback(atom.description, "缺少描述")}
                    </div>
                    <div className="mt-1 bg-gray-100 rounded">
                      {!atom.unset && atom.iptWay === IptWay.UserIpt && (
                        <div className="p-2 bg-gray-500 text-white rounded-t text-sm simple-ellipsis">
                          {atom.readableValue}
                        </div>
                      )}
                      <p className="text-xs p-1 text-gray-400 flex items-center justify-between">
                        {atom.unset ? "未设置" : `通过 ${getIptWayText(atom.iptWay)} 设置`}
                        {!atom.unset && <FaCheckCircle className="ml-2 text-green-400" size={12} />}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {detail.status === MergedIptParamStatus.unavaliable && nodeData.isConnecting && (
                <div className="mt-2 mb-1 text-red-400 flex items-center">
                  <FaExclamationCircle className="mr-1" />
                  当前节点不可匹配
                </div>
              )}
            </>
          )}
          {nodeData.mode === FlowDisplayPage.flow && (
            <>
              <p>{TextFallback(detail.description, "缺少描述")}</p>
              <p className="text-xs text-gray-400">{detail.key}</p>
              <Divider sx={{ my: 2 }} />

              <ul>
                {detail.atoms?.map((atom, i) => (
                  <li key={i} className="mt-2">
                    <div className="text-xs text-gray-400">
                      {i + 1}. {TextFallback(atom.description, "缺少描述")}
                    </div>
                    <div className="mt-1 bg-gray-100 rounded">
                      {!atom.unset && atom.iptWay === IptWay.UserIpt && (
                        <div className="p-2 bg-gray-500 text-white rounded-t text-sm simple-ellipsis">
                          {atom.readableValue}
                        </div>
                      )}
                      <p className="text-xs p-1 text-gray-400 flex items-center justify-between">
                        {atom.unset ? "未设置" : `通过 ${getIptWayText(atom.iptWay)} 设置`}
                        {!atom.unset && <FaCheckCircle className="ml-2 text-green-400" size={12} />}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {detail.status === MergedIptParamStatus.unavaliable && nodeData.isConnecting && (
                <div className="mt-2 mb-1 text-red-400 flex items-center">
                  <FaExclamationCircle className="mr-1" />
                  当前节点不可匹配
                </div>
              )}
            </>
          )}
          {[FlowDisplayPage.history, FlowDisplayPage.preview].includes(nodeData.mode) && (
            <>
              <p className="text-sm">{TextFallback(detail.description, "缺少描述")}</p>
              <p className="text-gray-400 text-xs">{detail.key}</p>
              <Divider sx={{ mt: 1 }} />
              <ul>
                {detail.atoms?.map((atom, i) => (
                  <li key={i} className="mt-2">
                    <div className="text-xs text-gray-400 flex items-center justify-between">
                      {i + 1}. {TextFallback(atom.description, "缺少描述")}
                    </div>
                    <div className="mt-1 p-2 bg-gray-500 text-white rounded text-sm simple-ellipsis">
                      {isLoading ? "loading..." : TextFallback(atoms[i]?.brief, "数据为空")}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Popover>
    </>
  );
};

export default TargetHandle;

export const VoidTargetHandle: React.FC<Connectable & { nodeData: BlocNodeData }> = ({ isConnectable, nodeData }) => {
  return (
    <Tooltip
      arrow
      title={
        <div className="max-w-xs">
          <p className="text-sm">流程输入</p>
          {!nodeData.connectableNodeIds.includes(nodeData.id) && nodeData.isConnecting && (
            <div className="mt-2 mb-1 text-red-400 flex items-center">
              <FaExclamationCircle className="mr-1" />
              当前节点不可匹配
            </div>
          )}
        </div>
      }
      placement="top"
    >
      <div className="relative ml-2">
        <Handle
          isConnectable={isConnectable}
          type="target"
          position={Position.Top}
          id={BLOC_FLOW_HANDLE_ID}
          data-handlepos="top"
          className={classNames(styles["void-handle"])}
        />
      </div>
    </Tooltip>
  );
};
