import React, { useMemo, useState } from "react";
import { Handle, Position } from "react-flow-renderer";
import classNames from "classnames";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { Popover } from "@mui/material";
import { Tooltip } from "@/components";
import { getBlocRecordDetail, StatefulMergedIptParam } from "@/api/flow";
import { BLOC_FLOW_HANDLE_ID } from "@/shared/constants";
import { FlowDisplayPage, MergedIptParamStatus } from "@/shared/enums";
import { BlocNodeData, Connectable } from "@/shared/types";
import { FaExclamationCircle } from "@/components/icons";
import { runningRecord } from "@/recoil/flow/node";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "../handles/handle.module.scss";

import { TargetValue } from "./Value";

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
  const { t } = useTranslation();
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
          title={[FlowDisplayPage.preview, FlowDisplayPage.history].includes(nodeData.mode) ? t("viewData") : false}
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
          <div
            className={classNames(
              "w-2.5 h-2.5 absolute left-0 top-0 border border-solid border-gray-200 rounded-full pointer-events-none",
              nodeData.mode !== FlowDisplayPage.draft
                ? detail.status === MergedIptParamStatus.avaliable
                  ? "bg-success"
                  : "bg-white"
                : "",
            )}
          >
            {nodeData.mode === FlowDisplayPage.draft && (
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
            )}
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
              <TargetValue isLoading={isLoading} param={detail} />
              {detail.status === MergedIptParamStatus.unavaliable && nodeData.isConnecting && (
                <div className="mt-2 mb-1 text-red-400 flex items-center">
                  <FaExclamationCircle className="mr-1" />
                  当前节点不可匹配
                </div>
              )}
            </>
          )}
          {nodeData.mode === FlowDisplayPage.flow && <TargetValue isLoading={isLoading} param={detail} />}
          {[FlowDisplayPage.history, FlowDisplayPage.preview].includes(nodeData.mode) && (
            <TargetValue isLoading={isLoading} param={detail} result={atoms} />
          )}
        </div>
      </Popover>
    </>
  );
};

export default TargetHandle;

export const VoidTargetHandle: React.FC<Connectable & { nodeData: BlocNodeData }> = ({ isConnectable, nodeData }) => {
  const { t } = useTranslation("flow");

  return (
    <Tooltip
      arrow
      title={
        <div className="max-w-xs">
          <p className="text-sm">{t("node.input")}</p>
          {!nodeData.connectableNodeIds.includes(nodeData.id) && nodeData.isConnecting && (
            <div className="mt-2 mb-1 text-red-400 flex items-center">
              <FaExclamationCircle className="mr-1" />
              {t("node.notConnectable")}
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
