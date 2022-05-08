import { atom, selector } from "recoil";
import { Connection, ParamConnectionEnd } from "@/shared/types";
import { mergeConnections, generateRemovedConnections, generateTempVoidConnection, getConnections } from "@/processors";
import { operationRecords } from "./param";
import { toReactFlowEdges } from "@/processors/convert";
import { blocNodeList } from "./node";
import { projectSettings } from "./flow";

export const connections = selector<Connection[]>({
  key: "defaultConnections",
  get: ({ get }) => {
    const nodes = get(blocNodeList);
    return getConnections(nodes);
  },
});

export const tempConnectionSource = atom<ParamConnectionEnd | null>({
  key: "connectionSource",
  default: null,
});

export const tempConnectionTarget = atom<ParamConnectionEnd | null>({
  key: "connectionTarget",
  default: null,
});

/**
 * 正在设置的连接
 */
export const tempConnection = selector({
  key: "tempSettingLine",
  get: ({ get }) => {
    const source = get(tempConnectionSource);
    const target = get(tempConnectionTarget);
    return generateTempVoidConnection(source, target);
  },
});

/**
 * 设置期间被取消的连接
 */
export const tempRemovedConnections = selector({
  key: "tempRemovedConnections",
  get: ({ get }) => {
    const disconnectedRecords = get(operationRecords).filter((record) => record.type === "disconnect");
    return generateRemovedConnections(disconnectedRecords);
  },
});

export const actualConnections = selector({
  key: "actualConnections",
  get: ({ get }) => {
    const fixed = get(connections);
    const temp = get(tempConnection);
    const removed = get(tempRemovedConnections);
    return mergeConnections(fixed, temp, removed);
  },
});

export const asReactFlowEdges = selector({
  key: "asReactFlowEdges",
  get: ({ get }) => {
    const connections = get(actualConnections);
    const settings = get(projectSettings);
    return toReactFlowEdges(connections, settings);
  },
});

export const beingRemovedConnectionAttrs = atom<{
  open: boolean;
  connection: Omit<Connection, "type"> | null;
}>({
  key: "removeConnectionAttrs",
  default: {
    open: false,
    connection: null,
  },
});
