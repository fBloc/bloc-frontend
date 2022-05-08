import React, { useCallback } from "react";
import classNames from "classnames";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { NodeProps } from "react-flow-renderer";
import { IconButton, Tooltip } from "@mui/material";
import { getRunningStateText, getRunningStateClass, getRunningIcon, FlowDisplayPage } from "@/shared/enums";
import { FaInfoCircle, FaDatabase } from "@/components/icons";
import BaseNode from "./BaseNode";
import { FnAtom } from "@/api/functions";
import { BlocNodeData } from "@/shared/types";
import { readableTime } from "@/shared/time";
import { recordAttrs, recordLogAttrs } from "@/recoil/flow/record";
import Sourcehandle, { VoidSourceHandle } from "../handles/SourceHandle";
import TargetHandle, { VoidTargetHandle } from "../handles/TargetHandle";
import EditNodeOpeations from "./EditNodeOpeations";
import { useNodeOperations } from "@/recoil/hooks/useNodeOperations";
import styles from "../handles/handle.module.scss";
import { useNavigate } from "react-router-dom";
import { flowDetailState } from "@/recoil/flow/flow";

/**
 * 编辑状态时atom的相关数据信息
 */
export type MergedAtomT = FnAtom &
  Partial<Record<"source" | "target" | "sourceHandle" | "targetHandle", string | null>>;

export type BlocNodeProps = NodeProps<BlocNodeData>;

const RunningState: React.FC<Pick<BlocNodeProps["data"], "latestRunningInfo">> = ({ latestRunningInfo, children }) => {
  if (!latestRunningInfo) return null;
  return (
    <div
      className={classNames(
        "mt-2 text-xs flex justify-between items-center border-t border-solid border-gray-100 pt-2 h-6",
        getRunningStateClass(latestRunningInfo?.status),
      )}
    >
      <Tooltip title={`${readableTime(latestRunningInfo.endTime)}`}>
        <p className="flex items-center">
          {getRunningIcon(latestRunningInfo?.status)}
          <span className="ml-1 font-medium">{getRunningStateText(latestRunningInfo?.status)}</span>
        </p>
      </Tooltip>
      {children}
    </div>
  );
};

const BlocNode: React.FC<BlocNodeProps> = ({ data, selected, isConnectable, id, type, ...rest }) => {
  const setRecordAttrs = useSetRecoilState(recordAttrs);
  const setLogAttrs = useSetRecoilState(recordLogAttrs);
  const flow = useRecoilValue(flowDetailState);
  const navigate = useNavigate();
  const onRecordClick = useCallback(() => {
    switch (data.mode) {
      case FlowDisplayPage.preview:
        navigate(`/flow/history/${flow?.latestRun?.id}?id=${flow?.originId}&node=${data.id}&operation=record`);
        break;
      case FlowDisplayPage.history:
        setRecordAttrs({
          open: true,
          nodeData: data,
        });
    }
  }, [data, setRecordAttrs, flow, navigate]);
  const viewLog = useCallback(() => {
    switch (data.mode) {
      case FlowDisplayPage.preview:
        navigate(`/flow/history/${flow?.latestRun?.id}?id=${flow?.originId}&node=${data.id}&operation=log`);

        break;
      case FlowDisplayPage.history:
        setLogAttrs({
          open: true,
          record: data.latestRunningInfo,
          node: data,
        });
    }
  }, [data, setLogAttrs, flow, navigate]);
  const { showNodeViewer } = useNodeOperations();

  return (
    <BaseNode
      className={classNames(
        "relative group px-2.5 pt-2.5 pb-4 bg-white rounded-lg w-64 border border-solid",
        selected ? "border-primary-400" : "border-gray-200",
      )}
      onDoubleClick={() => {
        showNodeViewer(id);
      }}
    >
      {data.mode === FlowDisplayPage.draft && <EditNodeOpeations nodeId={id} selected={selected} />}
      <div className={classNames("-translate-y-4 px-4 flex justify-center items-center")}>
        {data.statefulMergedIpts.map((item) => (
          <TargetHandle key={item.key} nodeData={data} detail={item} isConnectable={isConnectable} />
        ))}
        <VoidTargetHandle nodeData={data} isConnectable={isConnectable} />
      </div>
      <p className="leading-4">{data?.note || data.function?.name}</p>
      <p className="mt-2 text-gray-400 leading-4 text-xs">{data?.function?.description}</p>
      {[FlowDisplayPage.preview, FlowDisplayPage.history].includes(data.mode) && (
        <RunningState latestRunningInfo={data.latestRunningInfo}>
          <Tooltip title="查看日志" placement="bottom">
            <IconButton
              onClick={viewLog}
              sx={{
                ml: "auto",
              }}
            >
              <FaDatabase size={12} />
            </IconButton>
          </Tooltip>
          <Tooltip title="数据详情" placement="bottom">
            <IconButton onClick={onRecordClick}>
              <FaInfoCircle size={13} />
            </IconButton>
          </Tooltip>
        </RunningState>
      )}
      <div
        className={classNames("absolute left-0 w-full bottom-0 translate-y-1/2 px-4 flex justify-center items-center")}
      >
        <div
          className={classNames(styles["source-handle-container"], {
            "!hidden": data.function?.opt.length === 0,
          })}
        >
          {data.function?.opt.map((item) => (
            <Sourcehandle key={item.key} detail={item} isConnectable={isConnectable} nodeData={data} />
          ))}
        </div>
        <VoidSourceHandle isConnectable={isConnectable} nodeData={data} />
      </div>
    </BaseNode>
  );
};
export default BlocNode;
