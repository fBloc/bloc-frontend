import React, { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { NodeProps } from "react-flow-renderer";
import { IconButton, Tooltip, Popover, Divider, Chip } from "@mui/material";
import {
  getRunningStateText,
  getRunningStateClass,
  getRunningIcon,
  FlowDisplayPage,
  RunningStatusEnum,
} from "@/shared/enums";
import { FaInfoCircle, FaDatabase, FaExclamationCircle } from "@/components/icons";
import BaseNode from "./BaseNode";
import { FnAtom } from "@/api/functions";
import { BlocNodeData } from "@/shared/types";
import { readableTime } from "@/shared/time";
import { operationAttrs, RunningHistoryOperation } from "@/recoil/flow/operation";
import Sourcehandle, { VoidSourceHandle } from "../handles/SourceHandle";
import TargetHandle, { VoidTargetHandle } from "../handles/TargetHandle";
import EditNodeOpeations from "./EditNodeOpeations";
import { useNodeOperations } from "@/recoil/hooks/useNodeOperations";
import styles from "../handles/handle.module.scss";
import { flowDetailState } from "@/recoil/flow/flow";
import { showConfirm } from "@/components";
import i18n from "@/i18n";
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
const askPermission = () => {
  return showConfirm({
    title: i18n.t("toHistoryDetailPageConfirm", {
      ns: "flow",
    }),
  });
};
const BlocNode: React.FC<BlocNodeProps> = ({ data, selected, isConnectable, id, type, ...rest }) => {
  const setOperationAttrs = useSetRecoilState(operationAttrs);
  const flow = useRecoilValue(flowDetailState);
  const navigate = useNavigate();
  const onClick = useCallback(
    async (operation: RunningHistoryOperation) => {
      switch (data.mode) {
        case FlowDisplayPage.preview:
          const confirmed = await askPermission();
          if (confirmed) {
            navigate(
              `/flow/history/${flow?.latestRun?.id}?id=${flow?.originId}&node=${data.id}&operation=${operation}`,
            );
          }
          break;
        case FlowDisplayPage.history:
          setOperationAttrs({
            open: true,
            nodeId: data.id,
            operation,
          });
      }
    },
    [data, flow, navigate, setOperationAttrs],
  );
  const { showNodeViewer } = useNodeOperations();
  const { t } = useTranslation();
  /**节点是否未执行，前提是flow是有状态的*/
  const isIdleNode = useMemo(
    () =>
      [FlowDisplayPage.preview, FlowDisplayPage.history].includes(data.mode) &&
      !data.latestRunningInfo &&
      flow?.latestRun?.status === RunningStatusEnum.success,
    [flow, data],
  );
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const fn = useMemo(() => data.function, [data]);
  return (
    <>
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
        <p
          className="leading-4 hover:text-primary-400"
          onMouseEnter={(e) => {
            setAnchor(e.currentTarget);
          }}
          onMouseLeave={() => {
            setAnchor(null);
          }}
        >
          {data?.note || data.function?.name}
        </p>

        <p className="mt-2 text-gray-400 leading-4 text-xs">{data?.function?.description}</p>
        {[FlowDisplayPage.preview, FlowDisplayPage.history].includes(data.mode) && (
          <RunningState latestRunningInfo={data.latestRunningInfo}>
            <Tooltip title={t("viewLog")} placement="bottom">
              <IconButton
                onClick={() => {
                  onClick(RunningHistoryOperation.LOG);
                }}
                sx={{
                  ml: "auto",
                }}
              >
                <FaDatabase size={12} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("viewData")} placement="bottom">
              <IconButton
                onClick={() => {
                  onClick(RunningHistoryOperation.RESULT);
                }}
              >
                <FaInfoCircle size={13} />
              </IconButton>
            </Tooltip>
          </RunningState>
        )}
        {isIdleNode && (
          <p className="text-warning mt-2 flex items-center text-xs font-medium">
            <FaExclamationCircle className="mr-1" />
            {t("node.unableToRun", {
              ns: "flow",
            })}
          </p>
        )}
        <div
          className={classNames(
            "absolute left-0 w-full bottom-0 translate-y-1/2 px-4 flex justify-center items-center",
          )}
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
        sx={{
          pointerEvents: "none",
        }}
      >
        <div className="p-3 w-80">
          <span className="bg-gray-100 rounded px-2 py-1 text-xs">
            {t("node.source", {
              ns: "flow",
            })}
          </span>
          <p className="mt-2 my-1 flex items-center justify-between">
            {fn?.name}
            {!fn?.avaliable && (
              <Tooltip title={t("function.mayUnavaliable")} placement="top">
                <span>
                  <FaExclamationCircle className="text-yellow-500" />
                </span>
              </Tooltip>
            )}
          </p>
          <p className="text-gray-500 text-xs leading-5">{fn?.description}</p>
          <Divider sx={{ my: 1, opacity: 0.5 }} />
          <p className="text-xs text-gray-500">
            {t("function.providedBy", {
              provider: fn?.provider,
              ns: "flow",
            })}
          </p>
        </div>
      </Popover>
    </>
  );
};
export default BlocNode;
