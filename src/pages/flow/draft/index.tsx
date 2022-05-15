import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useQuery } from "react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getOrCreateDraft } from "@/api/flow";
import Board from "../components/Board";
import HeaderBar from "./Header";
import Functions from "./Functions";
import NodesBoard from "./NodesBoard";
import { flowDetailState, projectSettings } from "@/recoil/flow/flow";
import { FlowDisplayPage } from "@/shared/enums";
import { useResetFlowWhenDestroy } from "@/recoil/hooks/useResetFlow";

const FlowItem = () => {
  const { originId } = useParams<"originId">();
  const setFlow = useSetRecoilState(flowDetailState);
  const setProject = useSetRecoilState(projectSettings);
  useResetFlowWhenDestroy();
  const { isLoading } = useQuery(["getOrCreateDraft", originId], () => getOrCreateDraft(originId || ""), {
    enabled: !!originId,
    onSuccess: ({ data }) => {
      setFlow(data);
      setProject((previous) => ({
        ...previous,
        mode: FlowDisplayPage.draft,
      }));
    },
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    const onBeforeUnload: OnBeforeUnloadEventHandler = (event) => {
      event.preventDefault();
      return "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);
  return (
    <Board loadingFlow={isLoading}>
      <DndProvider backend={HTML5Backend}>
        <div className="h-screen flex flex-col">
          <HeaderBar />
          <div className="flex-grow flex items-stretch relative">
            <Functions />
            <NodesBoard />
          </div>
        </div>
      </DndProvider>
    </Board>
  );
};
export default FlowItem;
