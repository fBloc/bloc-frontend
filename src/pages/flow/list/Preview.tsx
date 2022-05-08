import React from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import LaunchedFlowOperations, { DraftFlowOperations } from "./Operations";
import FlowBody from "../components/FlowBody";
import { useReadonlyBoard } from "@/recoil/hooks/useReadonlyBoard";
import { flowDetailState, listCurrentOriginId, projectSettings } from "@/recoil/flow/flow";
import { useQuery } from "react-query";
import { getDetail, getDraft } from "@/api/flow";
import Board from "../components/Board";
import { flowListTab } from "@/recoil/flow/list";
import { FlowDisplayPage, FlowListType } from "@/shared/enums";

function fetchDetail(originId: string, isDraft: boolean) {
  return isDraft ? getDraft(originId) : getDetail(originId);
}
type PreviewProps = {
  //
};
const Preview: React.FC<PreviewProps> = ({ children }) => {
  const [flow, setFlow] = useRecoilState(flowDetailState);
  const setProject = useSetRecoilState(projectSettings);

  const originId = useRecoilValue(listCurrentOriginId);
  const flowTab = useRecoilValue(flowListTab);
  const { nodes, edges } = useReadonlyBoard();
  const { isFetching } = useQuery(
    ["fetchFlow", originId, flowTab],
    () => fetchDetail(originId, flowTab === FlowListType.draft),
    {
      enabled: !!originId,
      onSuccess: ({ data }) => {
        setFlow(data);
        setProject((previous) => ({
          ...previous,
          mode: FlowDisplayPage.preview,
        }));
      },
      refetchOnWindowFocus: false,
    },
  );
  return (
    <Board loadingFlow={isFetching}>
      <div className="flex-grow relative h-full flex">
        {flow ? (
          <>
            <div className="fixed right-4 top-4 z-10 flex bg-white p-1 rounded-lg shadow-sm">
              {flow.isDraft ? <DraftFlowOperations /> : <LaunchedFlowOperations />}
            </div>
            <FlowBody nodes={nodes} edges={edges} />
          </>
        ) : (
          <div className="absolute left-0 top-0 w-full h-full flex justify-center items-center">
            <p className="text-gray-500 text-sm">选择一个Flow进行查看</p>
          </div>
        )}
      </div>
      {children}
    </Board>
  );
};
export default Preview;
