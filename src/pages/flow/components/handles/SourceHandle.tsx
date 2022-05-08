import React, { useState, useMemo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { Popover, Tooltip } from "@mui/material";
import { useRecoilState } from "recoil";
import { useQuery } from "react-query";
import { OptParam } from "@/api/functions";
import { BLOC_FLOW_HANDLE_ID } from "@/shared/constants";
import { BlocNodeData, Connectable } from "@/shared/types";
import { runningRecord } from "@/recoil/flow/node";
import { getBlocRecordDetail } from "@/api/flow";
import styles from "./handle.module.scss";
import classNames from "classnames";

const SourceHandle: React.FC<{ detail: OptParam; nodeData: BlocNodeData } & Connectable> = ({
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
  const paramDetail = useMemo(() => {
    return recordDetail?.opt?.[detail.key];
  }, [recordDetail, detail.key]);
  return (
    <>
      <div
        className={classNames("relative mx-2 rounded-full", anchor !== null ? "scale-150 shadow" : "")}
        onClick={(e) => {
          setAnchor(e.currentTarget);
        }}
        onMouseEnter={(e) => {
          if (isConnectable) {
            setAnchor(e.currentTarget);
          }
        }}
        onMouseLeave={() => {
          if (isConnectable) {
            setAnchor(null);
          }
        }}
      >
        <Handle
          isConnectable={isConnectable}
          type="source"
          position={Position.Bottom}
          id={detail.key}
          className={styles["source-handle"]}
        />

        {!isConnectable && <span className="absolute left-0 top-0 w-full h-full"></span>}
      </div>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={
          isConnectable
            ? {
                pointerEvents: "none",
              }
            : {}
        }
        onClose={() => {
          setAnchor(null);
        }}
      >
        <div className="w-60 p-3">
          {isConnectable ? (
            <>
              <p className="mt-1">{detail.description}</p>
              <p className="text-xs text-gray-400">{detail.key}</p>
            </>
          ) : (
            <>
              <p className="mt-1">{detail.description}</p>
              <p className="text-xs text-gray-400">{detail.key}</p>
              <div className="mt-2 bg-gray-50 p-2 rounded break-all">{paramDetail?.brief}</div>
            </>
          )}
        </div>
      </Popover>
    </>
  );
};

export default SourceHandle;

export const VoidSourceHandle: React.FC<Connectable & { nodeData: BlocNodeData }> = ({ isConnectable }) => {
  return (
    <Tooltip title="流程输出" placement="top">
      <div className="relative">
        <Handle
          isConnectable={isConnectable}
          type="source"
          position={Position.Bottom}
          id={BLOC_FLOW_HANDLE_ID}
          className={styles["void-handle"]}
          data-handlepos="bottom"
        />
        {!isConnectable && <span className="absolute left-0 top-0 w-full h-full"></span>}
      </div>
    </Tooltip>
  );
};
