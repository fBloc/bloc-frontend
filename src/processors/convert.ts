import { Edge, MarkerType, Node } from "react-flow-renderer";
import { CustomEdgeTypes } from "@/pages/flow/components/connections";
import { ProjectSettings } from "@/recoil/flow/flow";
import { BlocNodeType, FlowDisplayPage } from "@/shared/enums";
import { BlocNodeData, BlocNodeItem, Connection, ConnectionType, EdgeData } from "@/shared/types";
import { uniq } from "lodash-es";
import { EditAtom, FlowBlocNode, FlowDetailT, ReadablePositionInfo } from "@/api/flow";

export const toReactFlowNodes = (
  sourceNodes: BlocNodeItem[],
  { connectableNodeIds, isConnecting }: { connectableNodeIds: string[]; isConnecting: boolean },
  { mode }: ProjectSettings,
): Node<BlocNodeData>[] => {
  const isEditMode = mode === FlowDisplayPage.draft;
  return sourceNodes.map(({ id, latestRunningInfo, function: fn, position, paramIpt, paramOpt, note }) => {
    return {
      id,
      className: "!pointer-events-auto",
      position: {
        x: position.left,
        y: position.top,
      },
      data: {
        function: fn,
        latestRunningInfo,
        id,
        paramOpts: paramOpt,
        statefulMergedIpts: paramIpt,
        note,
        isConnecting,
        connectableNodeIds,
        mode,
      },
      selectable: isEditMode,
      draggable: isEditMode,
      connectable: isEditMode,
      type: id === "0" ? BlocNodeType.start : BlocNodeType.job, // TODO 完善类型
    };
  });
};
type ReactFlowEdge = Omit<Edge<EdgeData>, "type"> & { type?: CustomEdgeTypes };
export const toReactFlowEdges = (sourceConnections: Connection[], settings: ProjectSettings): ReactFlowEdge[] => {
  const edges: ReactFlowEdge[] = [];
  const times = new Map<string, number[]>();
  sourceConnections.forEach(({ id, targetAtomIndex = [] }) => {
    const previous = times.get(id) || [];
    const result = [...previous, ...targetAtomIndex];
    const uniqResult = uniq(result);
    if (result.length !== uniqResult.length) {
      console.log("error!");
      //TODO  数量应该相同
    }
    times.set(id, uniqResult);
  });
  for (const connection of sourceConnections) {
    const { id, sourceNode, sourceParam, targetNode, targetParam, type } = connection;
    const isIndeterminate = type === ConnectionType.indeterminate;
    const targetLine = edges.find((item) => item.id === id);
    if (!targetLine) {
      const line = {
        id,
        source: sourceNode || "",
        target: targetNode || "",
        sourceHandle: sourceParam,
        targetHandle: targetParam,
        data: {
          atomIndexList: times.get(id) || [],
          mode: settings.mode,
        },
        animated: isIndeterminate,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        markerStart: MarkerType.Arrow,
        type: isIndeterminate ? undefined : ("removableEdge" as CustomEdgeTypes),
      };
      edges.push(line);
    }
  }
  return edges;
};

export const toSourceNodes = (nodes: BlocNodeItem[]): FlowDetailT["nodeToBlocMap"] => {
  return nodes.reduce((acc: FlowDetailT["nodeToBlocMap"], item) => {
    const info: FlowBlocNode<ReadablePositionInfo> = {
      functionId: item.function?.id || "",
      note: item.note,
      position: item.position,
      sourceNodeIds: item.voidIpt,
      targetNodeIds: item.voidOpt,
      paramIpts: item.paramIpt.reduce((acc: EditAtom[][], param) => {
        return [
          ...acc,
          param.atoms.map(({ unset, value, iptWay, valueType, sourceNode, sourceParam }) => {
            return {
              unset,
              value,
              iptWay,
              valueType,
              sourceNode,
              sourceParam,
            };
          }),
        ];
      }, []),
    };
    return {
      ...acc,
      [item.id]: info,
    };
  }, {});
};
