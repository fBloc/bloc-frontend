import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Board from "../components/Board";
import { getDetail } from "@/api/flow";
import FlowBody from "../components/FlowBody";
import History from "../components/History";
import Header from "./Header";
import Settings from "../components/Settings";
import { FaCog, FaHistory, FaProjectDiagram } from "@/components/icons";
import { SideTab, SideTabProps } from "./SideTab";
import { useQuery } from "react-query";
import { useSetRecoilState } from "recoil";
import { flowDetailState, projectSettings } from "@/recoil/flow/flow";
import { useReadonlyBoard } from "@/recoil/hooks/useReadonlyBoard";
import { useResetFlowWhenDestroy } from "@/recoil/hooks/useResetFlow";
import { FlowDisplayPage } from "@/shared/enums";
import i18n from "@/i18n";
const sideTabItems: SideTabProps<string>["items"] = [
  {
    label: <FaProjectDiagram size={20} />,
    tooltip: {
      title: i18n.t("flowChart") as string,
      placement: "right",
    },
    value: "flow",
  },
  {
    label: <FaHistory size={20} />,
    tooltip: {
      title: i18n.t("runningRecords") as string,
      placement: "right",
    },
    value: "history",
  },
  {
    label: <FaCog size={20} />,
    tooltip: {
      title: i18n.t("settings") as string,
      placement: "right",
    },
    value: "settings",
  },
];
const normalzieTab = (value: unknown) => {
  return value && typeof value === "string" && ["flow", "history", "settings"].includes(value) ? value : "flow";
};

// TODO  props完善
const Detail = () => {
  const { originId } = useParams<"originId">();
  const setFlow = useSetRecoilState(flowDetailState);
  const setProject = useSetRecoilState(projectSettings);

  useResetFlowWhenDestroy();
  const { isLoading } = useQuery(["fetchFlowDetail", originId], () => getDetail(originId), {
    enabled: !!originId,
    onSuccess: ({ data }) => {
      setFlow(data);
      setProject((previous) => ({
        ...previous,
        mode: FlowDisplayPage.flow,
      }));
    },
    refetchOnWindowFocus: false,
  });
  const { nodes, edges } = useReadonlyBoard();
  const [searchParams] = useSearchParams();
  const tab = normalzieTab(searchParams.get("tab"));

  return (
    <div className="h-screen flex flex-col relative">
      <Board loadingFlow={isLoading}>
        <Header tab={tab} className="shadow-sm relative" />
        <div className="flex-grow flex overflow-hidden">
          <SideTab items={sideTabItems} value={tab} />
          <div className="bg-gray-50 overflow-y-auto flex-grow">
            {tab === "flow" && <FlowBody nodes={nodes} edges={edges} />}
            {tab === "history" && <History />}
            {tab === "settings" && <Settings />}
          </div>
        </div>
      </Board>
    </div>
  );
};

export default Detail;
