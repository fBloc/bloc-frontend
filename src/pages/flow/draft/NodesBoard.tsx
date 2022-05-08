import React from "react";
import { useEdgesState, useNodesState } from "react-flow-renderer";
import AtomPicker from "./AtomPicker";
import NodeViewer from "./NodeViewer";
import FlowBody from "../components/FlowBody";
import { useBoard } from "./useBoard";
import RemoveConnection from "./RemoveConnection";

type NodeT = ReturnType<typeof useNodesState>;
type EdgeT = ReturnType<typeof useEdgesState>;

export const NodesBoardContext = React.createContext(
  {} as {
    edges: EdgeT[0];
    setEdges: EdgeT[1];
    nodes: NodeT[0];
    setNodes: NodeT[1];
  },
);
const NodesBoard = () => {
  const {
    nodes,
    edges,
    onEdgesChange,
    onNodesChange,
    onAtomPickerExited,
    onAtomPickerExit,
    onConnect,
    dropRef,
    onNodeViewerExited,
    onConnectStart,
    onConnectStop,
    onConnectEnd,
    onNodeDragStop,
    onMoveEnd,
    info,
  } = useBoard();

  if (!info?.position) return null;

  return (
    <>
      <div className="flex-grow bg-gray-50 relative" ref={dropRef}>
        <FlowBody
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onMoveEnd={onMoveEnd}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onNodeDragStop={onNodeDragStop}
          onConnectStop={onConnectStop}
          onConnectEnd={onConnectEnd}
          deleteKeyCode={null}
          zoomOnScroll={false}
          {...(info.position
            ? {
                defaultPosition: [info.position?.left || 0, info.position?.top || 0],
                defaultZoom: info.position?.zoom || 1,
              }
            : {})}
        />
      </div>
      <AtomPicker onExit={onAtomPickerExit} onExited={onAtomPickerExited} />
      <NodeViewer
        SlideProps={{
          onExited: onNodeViewerExited,
        }}
      />
      <RemoveConnection />
    </>
  );
};

export default NodesBoard;
