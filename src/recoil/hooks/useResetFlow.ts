import { useCallback, useEffect } from "react";
import { useResetRecoilState } from "recoil";
import { nodeViewAttrs, paramAtomsPickerAttrs } from "../flow/board";
import { tempConnectionSource, beingRemovedConnectionAttrs, tempConnectionTarget } from "../flow/connections";
import { flowDetailState, listCurrentOriginId, projectSettings } from "../flow/flow";
import { flowListTab } from "../flow/list";
import { blocNodeList, currentBlocNodeId } from "../flow/node";
import { operationRecords } from "../flow/param";
import { functionGroupState } from "../functions";

export function useResetFlowWhenDestroy() {
  const resetFlow = useResetRecoilState(flowDetailState);
  const resetBlocNodeList = useResetRecoilState(blocNodeList);
  const resetSettings = useResetRecoilState(projectSettings);
  const resetTempConnections = useResetRecoilState(tempConnectionSource);
  const resetRemovedConnections = useResetRecoilState(beingRemovedConnectionAttrs);
  const resetNodeViewerAtrts = useResetRecoilState(nodeViewAttrs);
  const resetTempConnectionSource = useResetRecoilState(tempConnectionSource);
  const resetTempConnectionTarget = useResetRecoilState(tempConnectionTarget);
  const resetCurrentBlocNodeId = useResetRecoilState(currentBlocNodeId);
  const resetNodes = useResetRecoilState(blocNodeList);
  const resetOpearationRecords = useResetRecoilState(operationRecords);
  const resetFunctions = useResetRecoilState(functionGroupState);
  // const resetFlowBlocNode = useResetRecoilState(currentReactFlowBlocNode);
  const resetAtomPickerAttrs = useResetRecoilState(paramAtomsPickerAttrs);
  const resetListCurrentOriginId = useResetRecoilState(listCurrentOriginId);
  const resetFlowListTab = useResetRecoilState(flowListTab);

  const reset = useCallback(() => {
    resetSettings();
    resetBlocNodeList();
    resetFlow();
    resetTempConnections();
    resetNodes();
    resetRemovedConnections();
    resetNodeViewerAtrts();
    resetTempConnectionSource();
    resetTempConnectionTarget();
    resetCurrentBlocNodeId();
    resetOpearationRecords();
    resetFunctions();
    resetAtomPickerAttrs();
    resetListCurrentOriginId();
    resetFlowListTab();
  }, [
    resetSettings,
    resetBlocNodeList,
    resetFlow,
    resetTempConnections,
    resetNodes,
    resetRemovedConnections,
    resetNodeViewerAtrts,
    resetTempConnectionSource,
    resetTempConnectionTarget,
    resetCurrentBlocNodeId,
    resetOpearationRecords,
    resetFunctions,
    resetAtomPickerAttrs,
    resetListCurrentOriginId,
    resetFlowListTab,
  ]);
  useEffect(() => {
    return reset;
  }, [reset]);
  return reset;
}
