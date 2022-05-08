import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { getDetail, getSomeHistoryDetail } from "@/api/flow";
import FlowBody from "../components/FlowBody";
import Board from "../components/Board";
import HeaderBar from "./Header";
import BlocRecord from "../components/BlocRecord";
import { useQuery } from "react-query";
import { flowDetailState, projectSettings } from "@/recoil/flow/flow";
import { FlowDisplayPage } from "@/shared/enums";
import { recordAttrs, recordLogAttrs } from "@/recoil/flow/record";
import { useReadonlyBoard } from "@/recoil/hooks/useReadonlyBoard";
import BlocLog from "../components/BlocLog";
import { getQuery } from "@/shared/tools";
import { BlocNodeData } from "@/shared/types";

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
  const [attrs, setRecordAttrs] = useRecoilState(recordAttrs);
  const [query] = useSearchParams();
  const node = query.get("node");
  const operation = query.get("operation");
  const setLogAttrs = useSetRecoilState(recordLogAttrs);
  const setFlow = useSetRecoilState(flowDetailState);
  const setProject = useSetRecoilState(projectSettings);
  const [initited, setInitiated] = useState(false);
  const { isLoading } = useQuery(
    ["getFlow", versionId],
    () =>
      getFlow({
        versionId,
      }),
    {
      refetchOnWindowFocus: false,
      enabled: !!versionId,
      onSuccess: ({ data }) => {
        setFlow(data);
        setProject((previous) => ({
          ...previous,
          mode: FlowDisplayPage.history,
        }));
      },
    },
  );
  const { nodes, edges } = useReadonlyBoard();
  useEffect(() => {
    if (!node || !operation || !nodes || nodes.length === 0 || initited) return;
    const nodeData = nodes.find((item) => item.id === node)?.data as BlocNodeData;
    if (!nodeData) return;
    switch (operation) {
      case "log":
        setLogAttrs({
          open: true,
          record: nodeData.latestRunningInfo,
          node: nodeData,
        });
        break;
      case "record":
        setRecordAttrs({
          open: true,
          nodeData,
        });
      default:
      //
    }
    setInitiated(true);
  }, [node, operation, nodes, setLogAttrs, setRecordAttrs, initited]);
  return (
    <Board loadingFlow={isLoading}>
      <HeaderBar className="fixed left-2 top-2 right-2 z-10 rounded-lg" />
      <div className="h-screen bg-gray-50">
        <FlowBody nodes={nodes} edges={edges} />
      </div>
      <BlocRecord
        open={attrs.open}
        TransitionProps={{
          onExit: () => {
            setRecordAttrs({
              ...attrs,
              open: false,
            });
          },
          onExited: () => {
            setRecordAttrs({
              ...attrs,
              nodeData: null,
            });
          },
        }}
      />
      <BlocLog />
    </Board>
  );
};
export default FlowHistory;
