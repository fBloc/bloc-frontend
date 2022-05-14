import { atom, selector } from "recoil";
import { FlowDetailT, FlowRunningStatus } from "@/api/flow";
import { FlowDisplayPage, RunningStatusEnum } from "@/shared/enums";
import i18n from "@/i18n";
export const flowDetailState = atom<FlowDetailT | null>({
  key: "flowDetail",
  default: null,
});

export const flowRecordsState = atom<{ items: FlowRunningStatus[] | null; total: number }>({
  key: "flowRunningRecords",
  default: {
    total: 0,
    items: [],
  },
});
/**
 * 是否是最近运行的flow
 */
export const isLatestRecordState = selector({
  key: "isLatestFlowRecordState",
  get: ({ get }) => {
    const records = get(flowRecordsState);
    const flow = get(flowDetailState);
    const recordId = flow?.latestRun?.id;
    return recordId && records?.items?.[0]?.id === recordId;
  },
});

export type ProjectSettings = {
  mode: FlowDisplayPage;
};
export const projectSettings = atom<ProjectSettings>({
  key: "flowProjectSettings",
  default: {
    mode: FlowDisplayPage.flow,
  },
});

export const listCurrentOriginId = atom({
  key: "listCurrentOriginId",
  default: "",
});

export const launchedFlow = atom({
  key: "launchedList",
  default: [],
});

export const flowState = atom({
  key: "flowState",
  default: {
    updating: false,
  },
});
const getCanExcute = (flow: FlowDetailT) => {
  const hasAccess = flow.execute;
  const isRunning =
    flow.latestRun?.status && [RunningStatusEnum.running, RunningStatusEnum.queue].includes(flow.latestRun?.status);
  const allowParallelRun = flow.allowParallelRun;
  let reason = "";
  if (isRunning && !allowParallelRun) {
    reason = i18n.t("parallelRunDisabld");
  }
  if (!hasAccess) {
    reason = i18n.t("noExcutePermission");
  }
  return {
    reason,
    result: hasAccess && (!isRunning || (isRunning && allowParallelRun)),
  };
};

export const flowGetters = selector({
  key: "flowReadonlyInfo",
  get: ({ get }) => {
    const flow = get(flowDetailState);
    if (!flow)
      return {
        canExcute: false,
        disableExcuteReason: "",
      };
    const { reason, result } = getCanExcute(flow);
    return {
      canExcute: result,
      disableExcuteReason: reason,
    };
  },
});
