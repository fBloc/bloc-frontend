import { useCallback, useRef } from "react";
import { useRecoilCallback, useRecoilState, useSetRecoilState } from "recoil";
import { Connection, Node, OnConnectStartParams, Viewport } from "react-flow-renderer";
import { useDrop } from "react-dnd";
import { BLOC_FLOW_HANDLE_ID } from "@/shared/constants";
import { tempConnectionSource, tempConnectionTarget } from "@/recoil/flow/connections";
import { useUpdateNodePosition } from "@/recoil/hooks/useUpdateNodePosition";
import { useAddNode } from "@/recoil/hooks/useAddNode";
import { useAddConnection } from "@/recoil/hooks/useAddConnection";
import { blocNodeList, connectableNodeIds, currentBlocNodeId } from "@/recoil/flow/node";
import { nodeViewAttrs, paramAtomsPickerAttrs } from "@/recoil/flow/board";
import { BlocNodeData, ParamConnectionEnd } from "@/shared/types";
import { useReadonlyBoard } from "@/recoil/hooks/useReadonlyBoard";
import { getAtomPickerAttrs } from "@/processors/param";
import { flowDetailState } from "@/recoil/flow/flow";

export function useBoard() {
  const setNodeViewerProps = useSetRecoilState(nodeViewAttrs);
  const { nodes, edges, onEdgesChange, onNodesChange, setNodes, setEdges } = useReadonlyBoard();
  const setConnectionSource = useSetRecoilState(tempConnectionSource);
  const setConnectionTarget = useSetRecoilState(tempConnectionTarget);
  const setAtomPickerAttrs = useSetRecoilState(paramAtomsPickerAttrs);
  const updateNodePosition = useUpdateNodePosition();
  const { addNode } = useAddNode();
  const addConnection = useAddConnection();
  const isValidConnection = useRef<boolean>(false); // 是否是有效的连接，用户可能中途取消

  const [info, updateFlowInfo] = useRecoilState(flowDetailState);
  const [, dropRef] = useDrop({
    accept: ["functionItem"],
    drop: async (item: { id: string }, m) => {
      const { x, y } = m.getClientOffset() || { x: 0, y: 0 };
      addNode(item.id, {
        note: "",
        position: {
          left: x,
          top: y - 60, // TODO距离设置
        },
      });
    },
  });
  const resetTempConnection = useCallback(() => {
    setConnectionSource(null);
    setConnectionTarget(null);
    isValidConnection.current = false;
  }, [setConnectionSource, setConnectionTarget]);

  const setCurrenBlocId = useSetRecoilState(currentBlocNodeId);

  const onNodeDragStop = useCallback(
    (_: any, target: Node) => {
      updateNodePosition(target.id, {
        left: target.position.x,
        top: target.position.y,
      });
    },
    [updateNodePosition],
  );
  const onConnectStart = useCallback(
    (_: any, data: OnConnectStartParams) => {
      if (data.handleType === "source") {
        const source = {
          nodeId: data.nodeId,
          param: data.handleId,
        };
        setConnectionSource(source);
      }
    },
    [setConnectionSource],
  );
  const getConnectableIds = useRecoilCallback(({ snapshot }) => () => {
    return snapshot.getPromise(connectableNodeIds);
  });
  const getNodes = useRecoilCallback(({ snapshot }) => () => {
    return snapshot.getPromise(blocNodeList);
  });
  const onConnect = useCallback(
    async ({ source, target, targetHandle, sourceHandle }: Connection) => {
      isValidConnection.current = true;

      const isFlowConnection = targetHandle === BLOC_FLOW_HANDLE_ID && sourceHandle === BLOC_FLOW_HANDLE_ID;
      const isParamConnection = targetHandle !== BLOC_FLOW_HANDLE_ID && sourceHandle !== BLOC_FLOW_HANDLE_ID;
      const nodes = await getNodes();
      const connectableIds = await getConnectableIds();
      if (!connectableIds.includes(target || "")) {
        console.log("disallowed");
        return;
      }
      if (!isFlowConnection && !isParamConnection) {
        // TODO提示
        return;
      }
      if (isParamConnection) {
        setConnectionTarget({
          nodeId: target,
          param: targetHandle,
        });
        setCurrenBlocId(target);
        setAtomPickerAttrs((previous) => ({
          ...previous,
          open: true,
          param: getAtomPickerAttrs(
            nodes,
            {
              nodeId: source,
              param: sourceHandle,
            },
            {
              nodeId: target,
              param: targetHandle,
            },
          ),
        }));
      }

      if (isFlowConnection) {
        addConnection({
          sourceNode: source,
          targetNode: target,
          isVoid: true,
        });
        resetTempConnection();
      }
    },
    [
      setConnectionTarget,
      addConnection,
      setAtomPickerAttrs,
      resetTempConnection,
      setCurrenBlocId,
      getConnectableIds,
      getNodes,
    ],
  );

  const onConnectEnd = useCallback(async () => {
    if (!isValidConnection.current) {
      setConnectionSource(null);
    }
    isValidConnection.current = false;
  }, [setConnectionSource]);

  const onMoveEnd = useCallback(
    (_, viewport: Viewport) => {
      updateFlowInfo((previous) =>
        previous
          ? {
              ...previous,
              position: {
                left: viewport.x,
                top: viewport.y,
                zoom: viewport.zoom,
              },
            }
          : null,
      );
    },
    [updateFlowInfo],
  );
  const onNodeClick = useCallback(
    (node: Node<BlocNodeData>) => {
      setNodeViewerProps((previous) => ({
        ...previous,
        open: true,
      }));
      setCurrenBlocId(node.id);
    },
    [setCurrenBlocId, setNodeViewerProps],
  );

  return {
    onConnect,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    onNodeClick,
    dropRef,
    onConnectStart,
    onConnectEnd,
    onNodeDragStop,
    onMoveEnd,
    info,
  };
}
