import { atom, selector } from "recoil";
import { OperationRecord } from "@/shared/types";
import { tempConnectionSource } from "./connections";
import { collectAbsoluteConnctableParams, collectMayConnectableParams } from "@/processors/param";
import { blocNodeList, connectableNodeIds } from "./node";
import { isTruthyValue } from "@/shared/tools";
import { MergedInputParam } from "@/api/flow";

/**
 * 设置参数时在连接方面的操作
 */
export const operationRecords = atom<OperationRecord[]>({
  key: "operationRecords",
  default: [],
});

export const absConnectableParams = selector({
  key: "absConnectableParams",
  get: ({ get }) => {
    const source = get(tempConnectionSource);
    if (!source) return [];
    const nodes = get(blocNodeList);
    const nodeIds = get(connectableNodeIds)
      .map((id) => nodes.find((node) => node.id === id))
      .filter(isTruthyValue);
    const sourceParam =
      nodes.find((node) => node.id === source.nodeId)?.paramOpt.find((param) => param.key === source.param) || null;
    return collectAbsoluteConnctableParams(nodeIds, sourceParam);
  },
});

export const mayConnectableParams = selector({
  key: "mayConnectableParams",
  get: ({ get }) => {
    const source = get(tempConnectionSource);
    if (!source) return [];
    const nodes = get(blocNodeList);
    const nodeIds = get(connectableNodeIds)
      .map((id) => nodes.find((node) => node.id === id))
      .filter(isTruthyValue);
    const sourceParam =
      nodes.find((node) => node.id === source.nodeId)?.paramOpt.find((param) => param.key === source.param) || null;
    return collectMayConnectableParams(nodeIds, sourceParam);
  },
});

export const editAtomsState = atom<MergedInputParam[]>({
  key: "editAtomsState",
  default: [],
});
