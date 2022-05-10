import React, { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useQuery } from "react-query";
import { getDetail, getSomeHistoryDetail } from "@/api/flow";
import FlowBody from "../components/FlowBody";
import Board from "../components/Board";
import HeaderBar from "./Header";
import BlocResult from "./BlocResult";
import { flowDetailState, projectSettings } from "@/recoil/flow/flow";
import { FlowDisplayPage, RunningStatusEnum } from "@/shared/enums";
import { operationAttrs, RunningHistoryOperation } from "@/recoil/flow/operation";
import { useReadonlyBoard } from "@/recoil/hooks/useReadonlyBoard";
import BlocLog from "./BlocLog";
interface Ids {
  originId?: string;
  versionId?: string;
}
const getFlow = ({ originId, versionId }: Ids) => {
  if (versionId) return getSomeHistoryDetail(versionId);
  return getDetail(originId || "");
};

const FlowHistory = () => {
  const { versionId } = useParams<"versionId">();
  const [query] = useSearchParams();
  const node = query.get("node");
  const operation = query.get("operation");
  const [flow, setFlow] = useRecoilState(flowDetailState);
  const [attrs, setOperationAttrs] = useRecoilState(operationAttrs);
  const setProject = useSetRecoilState(projectSettings);
  const [initited, setInitiated] = useState(false);
  const { nodes, edges } = useReadonlyBoard();

  const setNodeOperation = useCallback(
    (operation: RunningHistoryOperation, nodeId: string) => {
      if (!nodeId) return;
      const isValidOperation = [RunningHistoryOperation.LOG, RunningHistoryOperation.RESULT].includes(operation);
      if (!isValidOperation) return;
      setOperationAttrs({
        open: true,
        operation: operation,
        nodeId,
      });
    },
    [setOperationAttrs],
  );
  const { isLoading } = useQuery(
    ["getFlow", versionId],
    () =>
      getFlow({
        versionId,
      }),
    {
      refetchOnWindowFocus: false,
      enabled: !!versionId,
      refetchInterval: flow?.latestRun?.status === RunningStatusEnum.running ? 2000 : false,
      onSuccess: ({ data }) => {
        setFlow(data);
        setProject((previous) => ({
          ...previous,
          mode: FlowDisplayPage.history,
        }));
      },
    },
  );
  useEffect(() => {
    if (!node || !operation || !nodes || nodes.length === 0 || initited) return;
    setNodeOperation(operation as any, node);
    setInitiated(true);
  }, [node, operation, nodes, initited, setNodeOperation]);
  return (
    <Board loadingFlow={isLoading}>
      <HeaderBar className="fixed left-2 top-2 right-2 z-10" />
      <div className="h-screen bg-gray-50">
        <FlowBody nodes={nodes} edges={edges} />
      </div>
      <BlocResult />
      <BlocLog />
    </Board>
  );
};
export default FlowHistory;
