import React from "react";
import ReactFlow, { Background, Controls, ReactFlowProps, MiniMap } from "react-flow-renderer";
import { nodeTypes } from "./nodes";
import edgeTypes from "./connections";

const FlowBody: React.FC<Partial<ReactFlowProps>> = ({ ...rest }) => {
  return (
    <ReactFlow nodeTypes={nodeTypes} edgeTypes={edgeTypes} {...rest}>
      <Background />
      <Controls showInteractive={false} />
      <MiniMap />
    </ReactFlow>
  );
};
export default FlowBody;
