import { findLogicNodeById } from ".";
import { CanvasEvents } from "../common";
import { Canvas, LogicNode } from "@/fabric/objects";
import { nodeSettings } from "@/fabric/settings";
type Nodes = Map<
  string,
  {
    rows: number[];
    column: number;
    isLeaf: boolean;
    node: LogicNode;
  }
>;
function collectNodes(canvas: Canvas, nodeId: string, nodes: Nodes, row: number, column: number) {
  const node = findLogicNodeById(canvas, nodeId);
  if (node) {
    const previousRows = nodes.get(nodeId)?.rows || [];
    nodes.set(nodeId, {
      rows: [...previousRows, row],
      isLeaf: node.downstream.length > 0,
      column,
      node,
    });
  }
  if (node?.downstream) {
    node.downstream.forEach((nodeId, index) => {
      collectNodes(canvas, nodeId, nodes, row + 1, index);
    });
  }
}

export function prettierCoordinates(canvas: Canvas, entry: LogicNode) {
  const nodes: Nodes = new Map();
  const coordinates = new Set<string>();

  entry.downstream.forEach((nodeId, index) => {
    collectNodes(canvas, nodeId, nodes, 1, index);
  });
  const entries = Array.from(nodes.entries());

  entries.forEach(([id, attrs]) => {
    const { rows, node } = attrs;
    let column = 0;
    const row = Math.max(...rows);
    let seeking = true;
    while (seeking) {
      column += 1;
      if (!coordinates.has(`${column}x${row}`)) {
        coordinates.add(`${column}x${row}`);
        nodes.set(id, {
          ...attrs,
          column,
        });
        seeking = false;
      }
    }
    node.setOptions({
      left: (nodeSettings.width + 100) * column,
      top: (nodeSettings.height + 100) * row,
    });
    node.setCoords();
    node.bringToFront();
    node.fire(CanvasEvents.OBJECT_MOVING);
  });
  const e = Array.from(nodes.entries()).map((i) => i[1].column);
  const minLeft = Math.min(...e);
  const maxLeft = Math.max(...e);
  const start = findLogicNodeById(canvas, "0");
  start?.setOptions({
    left: ((nodeSettings.width + 100) * (minLeft + maxLeft)) / 2,
    top: 0,
  });
  start?.setCoords();
  canvas.renderAll();
  start?.fire(CanvasEvents.OBJECT_MOVING);
  const result = entries.map(([id, { rows, column }]) => ({
    [id]: {
      row: Math.max(...rows),
      column,
    },
  }));
}
