import RemovableConnection from "./RemovableConnection";

const edgeTypes = {
  removableEdge: RemovableConnection,
};

export default edgeTypes;
export type CustomEdgeTypes = keyof typeof edgeTypes;
