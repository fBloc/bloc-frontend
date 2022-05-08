import React, { useMemo, useState } from "react";
import { Handle, Position } from "react-flow-renderer";
import classNames from "classnames";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";
import { Popover, Divider, Tooltip } from "@mui/material";
import { getBlocRecordDetail, StatefulMergedIptParam } from "@/api/flow";
import { BLOC_FLOW_HANDLE_ID } from "@/shared/constants";
import { MergedIptParamStatus } from "@/shared/enums";
import { TextFallback } from "@/shared/jsxUtils";
import { BlocNodeData, Connectable } from "@/shared/types";
import { FaExclamationCircle } from "@/components/icons";
import { runningRecord } from "@/recoil/flow/node";
import styles from "../handles/handle.module.scss";

const percentage = (value: number) => {
  return `${Math.round(value * 100)}%`;
};
const TargetHandle: React.FC<{ detail: StatefulMergedIptParam; nodeData: BlocNodeData } & Connectable> = ({
  detail,
  isConnectable,
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

  return (
    <>
      <div
        className={classNames("relative mx-2 grxoup rounded-full", anchor !== null ? "scale-150 shadow" : "")}
        onClick={(e) => {
          setAnchor(e.target as any);
        }}
        onMouseEnter={(e) => {
          if (isConnectable) {
            setAnchor(e.target as any);
          }
        }}
        onMouseLeave={() => {
          if (isConnectable) {
            setAnchor(null);
          }
        }}
      >
        <Handle
          isConnectable={false}
          type="target"
          id={detail.key}
          position={Position.Top}
          className={classNames(
            styles["target-handle"],
            detail.status === MergedIptParamStatus.avaliable ? "!bg-white !border-green-300" : "",
            detail.status === MergedIptParamStatus.indeterminate ? "!bg-white !border-yellow-300" : "",
            detail.status === MergedIptParamStatus.unavaliable
              ? "!bg-white !border-gray-200 hover:!border-red-400"
              : "",
            "hover:!border-gray-400",
          )}
        />
      </div>
      <Popover
        disableRestoreFocus
        open={!!anchor}
        anchorEl={anchor}
        sx={
          isConnectable
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
          {isConnectable ? (
            <>
              <p>{TextFallback(detail.description, "缺少描述")}</p>
              <p className="text-xs text-gray-400">{detail.key}</p>
              <ul className="mt-1 pl-4 opacity-80">
                {detail.atoms?.map((atom, i) => (
                  <li key={i} className="list-disc my-2">
                    <span className="bg-gray-100 px-1 py-0.5 rounded mr-1 scale-90 inline-flex">子项 {i + 1}</span>
                    {TextFallback(atom.description, "缺少描述")}
                  </li>
                ))}
              </ul>
              <Divider sx={{ my: 2 }} />
              <p
                className="flex justify-between items-center text-gray-400"
                style={{
                  minWidth: "160px",
                }}
              >
                <span>完成进度:</span>
                <span>{percentage(detail.progress)}</span>
              </p>
              {detail.status === MergedIptParamStatus.unavaliable && nodeData.isConnecting && (
                <div className="mt-2 mb-1 text-red-400 flex items-center">
                  <FaExclamationCircle className="mr-1" />
                  当前节点不可匹配
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm">{TextFallback(detail.description, "缺少描述")}</p>
              <p className="text-gray-400 text-xs">{detail.key}</p>
              <Divider sx={{ mt: 2 }} />
              <ul>
                {detail.atoms?.map((atom, i) => (
                  <li key={i} className="mt-4">
                    <div className="text-xs text-gray-400">
                      {i + 1}. {TextFallback(atom.description, "缺少描述")}
                    </div>
                    <div className="mt-1.5 p-2 bg-gray-100 rounded text-sm simple-ellipsis">
                      {isLoading ? "loading..." : TextFallback(atoms[i]?.brief, "内容为空")}
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

        {!isConnectable && <span className="absolute left-0 top-0 w-full h-full"></span>}
      </div>
    </Tooltip>
  );
};
