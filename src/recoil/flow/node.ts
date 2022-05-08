import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { Node } from "react-flow-renderer";
import { OriginBlocRecordDetail, FullStateAtom, BlocRecordDetail } from "@/api/flow";
import { BlocNodeData, BlocNodeItem } from "@/shared/types";
import { DEFAULT_EDIT_ATOM_DESCCRIPTOR } from "@/shared/defaults";
import { collectConnectableNodeIds, extractNodes, flatParamAtoms, withSourceParamStateNodes } from "@/processors";
import { flowDetailState, projectSettings } from "./flow";
import { tempConnectionSource } from "./connections";
import { flatFunctionState } from "../functions";
import { toReactFlowNodes } from "@/processors/convert";
import { isTruthyValue } from "@/shared/tools";
import { absConnectableParams, mayConnectableParams } from "./param";

export const currentBlocNodeId = atom<string | null>({
  key: "currentBlocNodeId",
  default: null,
});

export const currentBlocNode = selector<BlocNodeItem | null>({
  key: "currentBlocNode",
  get: ({ get }) => {
    const nodeId = get(currentBlocNodeId);
    const nodes = get(blocNodeList);
    if (!nodeId) return null;
    const result = nodes.find((node) => node.id === nodeId);
    if (!result) {
      // TODO 没找到可能是出了问题
      return null;
    }
    return result;
  },
});

export const currentReactFlowBlocNode = selector<Node<BlocNodeData> | null>({
  key: "currentReactFlowBlocNode",
  get: ({ get }) => {
    const nodeId = get(currentBlocNodeId);
    const nodes = get(asReactFlowNodes);
    if (!nodeId) return null;
    const result = nodes.find((node) => node.id === nodeId);
    if (!result) {
      // TODO 没找到可能是出了问题
      return null;
    }
    return result;
  },
});

/**
 * 当前正在设置的bloc node值设置
 */

type NodeId = string;
type BlocId = string;
type AtomIndex = number;

export type AtomKey = `${NodeId}_${BlocId}_${AtomIndex}`;

export const atomEditState = atomFamily<FullStateAtom, AtomKey>({
  key: "atomEditState",
  default: selectorFamily({
    key: "atomEditState/default",
    get:
      (param) =>
      ({ get }) => {
        const node = get(currentBlocNode);

        if (!node) {
          // TODO error提示
          console.log("has no such node");
          return DEFAULT_EDIT_ATOM_DESCCRIPTOR;
        }
        const atoms = flatParamAtoms(node.paramIpt);
        const target = atoms.find((atom) => `${node.id}_${atom.targetParam}_${atom.atomIndex}` === param);
        if (!target) {
          console.log("no target found");
          // TODO error提示
          return DEFAULT_EDIT_ATOM_DESCCRIPTOR;
        }
        return target;
      },
  }),
});

const defaultBlocNodeList = selector({
  key: "defaultBlocNodeItems",
  get: ({ get }) => {
    const flow = get(flowDetailState);
    const functions = get(flatFunctionState);
    return extractNodes(flow, functions);
  },
});

export const blocNodeList = atom<BlocNodeItem[]>({
  key: "blocNodeList",
  default: defaultBlocNodeList,
});

/**
 * 连接时可被连接的节点ID
 */
export const connectableNodeIds = selector({
  key: "connectableNodeIds",
  get: ({ get }) => {
    const nodes = get(blocNodeList);
    const source = get(tempConnectionSource);
    return collectConnectableNodeIds(nodes, source);
  },
});

export const connectableNodes = selector({
  key: "connectableNodes",
  get: ({ get }) => {
    const ids = get(connectableNodeIds);
    const nodes = get(blocNodeList);
    return ids.map((id) => nodes.find((node) => node.id === id)).filter(isTruthyValue);
  },
});

export const actualBlocNodeList = selector<BlocNodeItem[]>({
  key: "actualBlocNodeList",
  get: ({ get }) => {
    const sourceNodes = get(blocNodeList);
    const sourceParam = get(tempConnectionSource);
    const ids = get(connectableNodeIds);
    return withSourceParamStateNodes(sourceNodes, {
      mayConnectableParams: get(mayConnectableParams),
      absConnectableParams: get(absConnectableParams),
      connectableNodeIds: ids,
      sourceParam,
    });
  },
});

export const asReactFlowNodes = selector({
  key: "asReactFlowNodes",
  get: ({ get }) => {
    const nodes = get(actualBlocNodeList);
    const settings = get(projectSettings);
    const ids = get(connectableNodeIds);
    const isConnecting = !!get(tempConnectionSource);

    return toReactFlowNodes(
      nodes,
      {
        isConnecting,
        connectableNodeIds: ids,
      },
      settings,
    );
  },
});

export const runningRecord = atomFamily<BlocRecordDetail | null, string>({
  key: "runningRecord",
  default: null,
});
