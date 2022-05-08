import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useEdgesState, useNodesState } from "react-flow-renderer";
import { asReactFlowEdges } from "../flow/connections";
import { asReactFlowNodes } from "../flow/node";

export function useReadonlyBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const sourceNodes = useRecoilValue(asReactFlowNodes);
  const sourceConnections = useRecoilValue(asReactFlowEdges);
  useEffect(() => {
    setEdges(sourceConnections);
  }, [sourceConnections, setEdges]);

  useEffect(() => {
    setNodes(sourceNodes);
  }, [setNodes, sourceNodes]);
  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setNodes,
  };
}
