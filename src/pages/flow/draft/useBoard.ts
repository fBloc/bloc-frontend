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
import { useClearAllAtoms } from "@/recoil/hooks/useClearAtom";
import { BlocNodeData, ParamConnectionEnd } from "@/shared/types";
import { useReadonlyBoard } from "@/recoil/hooks/useReadonlyBoard";
import { editAtomsState } from "@/recoil/flow/param";
import { showPrompt } from "@/components";
import { getAtomPickerAttrs } from "@/processors/param";
import { flowDetailState } from "@/recoil/flow/flow";

export function useBoard() {
  const setNodeViewerProps = useSetRecoilState(nodeViewAttrs);
  const { nodes, edges, onEdgesChange, onNodesChange, setNodes, setEdges } = useReadonlyBoard();
  const setConnectionSource = useSetRecoilState(tempConnectionSource);
  const setConnectionTarget = useSetRecoilState(tempConnectionTarget);
  const setAtomPickerAttrs = useSetRecoilState(paramAtomsPickerAttrs);
  const updateNodePosition = useUpdateNodePosition();
  const clearAllAtoms = useClearAllAtoms();
  const { addNode } = useAddNode();
  const addConnection = useAddConnection();
  const tempTarget = useRef<ParamConnectionEnd | null>(null);
  const setAtomShot = useSetRecoilState(editAtomsState);
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
    tempTarget.current = null;
  }, [setConnectionSource, setConnectionTarget]);

  const onAtomPickerExited = useCallback(() => {
    resetTempConnection();
  }, [resetTempConnection]);
  const setCurrenBlocId = useSetRecoilState(currentBlocNodeId);
  const onAtomPickerExit = useCallback(() => {
    setAtomPickerAttrs((previous) => ({
      ...previous,
      open: false,
    }));
  }, [setAtomPickerAttrs]);
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
      tempTarget.current = {
        nodeId: target,
        param: targetHandle,
      };

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

  const onConnectStop = useCallback(() => {
    // stop
  }, []);
  const onConnectEnd = useCallback(async () => {
    if (!tempTarget.current) {
      setConnectionSource(null);
    }
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
  const onNodeViewerExited = useCallback(() => {
    setAtomShot([]);
    clearAllAtoms();
    setCurrenBlocId(null);
  }, [setAtomShot, setCurrenBlocId, clearAllAtoms]);
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
    onAtomPickerExited,
    onAtomPickerExit,
    onConnect,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    onNodeClick,
    onNodeViewerExited,
    dropRef,
    onConnectStart,
    onConnectStop,
    onConnectEnd,
    onNodeDragStop,
    onMoveEnd,
    info,
  };
}
