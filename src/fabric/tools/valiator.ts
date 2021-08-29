import { LogicNode, NodeType } from "@/fabric/objects";

export interface IInValidNode {
  name: string;
  erororText: string;
  nodeId: string;
}
export function isValidChain(nodes: LogicNode[]) {
  const inValidNodes: IInValidNode[] = [];
  nodes.forEach((node) => {
    const hasUpstream = node.upstream.length > 0;
    const hasDownstream = node.downstream.length > 0;
    const isStartNode = node.nodeType === NodeType.system;
    const valid = (isStartNode && hasDownstream) || hasUpstream;
    if (!valid) {
      const msg = isStartNode ? "下游节点为空" : "上游节点为空";
      inValidNodes.push({
        name: node.name,
        nodeId: node.id,
        erororText: msg,
      });
    }
  });
  return {
    isValid: inValidNodes.length === 0,
    inValidNodes,
  };
}
