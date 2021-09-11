import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import hotkeys from "hotkeys-js";
import { Position } from "@/common";
import { nodeSettings } from "../settings";
import {
  BasicFlow,
  Bloc,
  BlocStartNode,
  Canvas,
  Flow,
  FlowStartNode,
  isFlowNode,
  isLogicNode,
  LogicNode,
} from "@/fabric/objects";
import { IArrangementFlow } from "@/api/arrangement";
import { CanvasEvents, defaultPosition, ICoordinate } from "../common";
import { BlocItem } from "@/api/flow";

const X_GAP = 40;
const Y_GAP = 80;

export function calculateSubTreeNodesPosition({ x, y }: ICoordinate, childNodesCount: number) {
  const { width: flowWidth, height: flowHeight } = nodeSettings;
  const childNodesWidth = childNodesCount * flowWidth + (childNodesCount - 1) * X_GAP;
  const leftEdge = (flowWidth - childNodesWidth) / 2 + x;
  const edges = [];
  for (let i = 0; i < childNodesCount; i++) {
    edges.push({
      left: leftEdge + (flowWidth + X_GAP) * i,
      top: y + flowHeight + Y_GAP,
    });
  }
  return edges;
}

export function calculateEdgeSubNodePosition(flow: BasicFlow) {
  const nodes = flow.downstream.map((id) =>
    flow.canvas?._objects.find((node) => isFlowNode(node) && node.id === id),
  ) as BasicFlow[];
  const coordinates = nodes.map(({ left = 0, top = 0 }) => ({ left, top }));
  const maxLeft = coordinates.sort((a, b) => a.left - b.left).pop();

  return {
    left: maxLeft ? maxLeft.left + nodeSettings.width + X_GAP : flow.left || 0,
    top: (flow.top || 0) + nodeSettings.height + Y_GAP,
  };
}

export function getMaxRightBottom({ left, top }: Position) {
  return {
    right: left + X_GAP + nodeSettings.width,
    bottom: top + Y_GAP,
  };
}

export function generateUniFlowIdentifier() {
  return uuidv4(); // TODO
}
export function isSelection(object: unknown): object is fabric.ActiveSelection {
  return object instanceof fabric.ActiveSelection;
}
export function getNodeAbsoluteCoordinate(node: LogicNode) {
  const group = node.group;
  const insideGroup = isSelection(group);
  const { left = 0, top = 0 } = node;
  let shiftX = 0;
  let shiftY = 0;
  if (group && insideGroup) {
    const { left: gLeft = 0, top: gTop = 0, width = 0, height = 0 } = group;
    shiftX = gLeft + width / 2;
    shiftY = gTop + height / 2;
  }
  return {
    x: left + shiftX,
    y: top + shiftY,
  };
}

export function findLogicNodeById(canvas: Canvas | undefined, id: string) {
  return canvas?._objects.filter(isLogicNode).find((item) => item.id === id);
}

export function isCircular(canvas: Canvas, destination: string, source: string): boolean {
  if (!destination || !source) return false;
  const destNode = findLogicNodeById(canvas, destination);
  if (!destNode) return false;
  if (destNode.downstream.includes(source)) return true;
  return destNode?.downstream.some((id) => isCircular(canvas, id, source));
}

export function renderFlows(
  canvas: Canvas,
  flows: Map<string, IArrangementFlow & { id: string }>,
  nameMap?: Map<string, string>,
) {
  if (!canvas) return;
  const startFlow = flows.get("0");
  const restFlows = Array.from(flows.entries())
    .filter(([id]) => id !== "0")
    .map(([_, item]) => item);
  const starter = new FlowStartNode({
    upstream: startFlow?.upstream_flow_ids || [],
    downsream: startFlow?.downstream_flow_ids || [],
    left: canvas.getWidth() / 2 - nodeSettings.width / 2,
    top: 30,
  });
  canvas.add(starter);
  restFlows.forEach(({ flow_origin_id, id, downstream_flow_ids, upstream_flow_ids, position }) => {
    const _position = position || {};
    const flow = new Flow({
      flowId: flow_origin_id,
      name: nameMap?.get(flow_origin_id) || "测试名称测试名称",
      id,
      downsream: downstream_flow_ids || [],
      upstream: upstream_flow_ids || [],
      ...{
        ...defaultPosition,
        ..._position,
      },
    });
    canvas.setZoom(0.4);
    canvas.add(flow);
  });
}

export function connecFlows(canvas: Canvas) {
  const flows = canvas._objects.filter(isFlowNode) as Flow[];
  flows.forEach((flow) => {
    flow.drawInlines();
  });
}

export function makeCanvasZoomable(canvas: Canvas) {
  let dragging = false;
  let lastPos = {
    x: 0,
    y: 0,
  };
  const onMouseWheel = (event: fabric.IEvent) => {
    const delta = (event.e as WheelEvent).deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 2) zoom = 2;
    if (zoom < 0.1) zoom = 0.1;
    canvas.setZoom(zoom);
    canvas.fire(CanvasEvents.ZOOMED, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
  };
  const initDrag = (event: fabric.IEvent) => {
    const evt = event.e as MouseEvent;
    const canDrag = canvas.spacebarPressed || (!event.target && canvas.readonly);
    if (canDrag) {
      dragging = true;
      if (canvas.selection) {
        canvas.selection = false;
      }
      lastPos = {
        x: evt.clientX,
        y: evt.clientY,
      };
    }
  };
  const dragCanvas = (event: fabric.IEvent) => {
    if (dragging) {
      const e = event.e as MouseEvent;
      const vpt = canvas.viewportTransform;
      if (!vpt) return;
      const { x, y } = lastPos;
      vpt[4] += e.clientX - x;
      vpt[5] += e.clientY - y;
      canvas.requestRenderAll();

      lastPos = {
        x: e.clientX,
        y: e.clientY,
      };
    }
  };
  const cancelDrag = () => {
    if (!canvas.viewportTransform) return;
    canvas.setViewportTransform(canvas.viewportTransform);
    if (!canvas.readonly) {
      canvas.selection = true;
    }
    if (dragging) {
      canvas.fire("transformed");
    }
    dragging = false;
  };
  canvas.on(CanvasEvents.MOUSE_WHEEL, onMouseWheel);
  canvas.on(CanvasEvents.CANVAS_MOUSE_DOWN, initDrag);
  canvas.on(CanvasEvents.CANVAS_MOUSE_MOVE, dragCanvas);
  canvas.on(CanvasEvents.CANVAS_MOUSE_UP, cancelDrag);
  const onKeyDown = (e: KeyboardEvent) => {
    const keydown = e.type === "keydown";
    canvas.spacebarPressed = keydown;
  };
  hotkeys("space", { keyup: true }, onKeyDown);
  return () => {
    canvas.off(CanvasEvents.MOUSE_WHEEL, onMouseWheel);
    canvas.off(CanvasEvents.CANVAS_MOUSE_DOWN, initDrag);
    canvas.off(CanvasEvents.CANVAS_MOUSE_MOVE, dragCanvas);
    canvas.off(CanvasEvents.CANVAS_MOUSE_UP, cancelDrag);
    hotkeys.unbind("space", onKeyDown);
  };
}

export function getLogicNodes(canvas?: Canvas) {
  return canvas?._objects.filter(isLogicNode) || [];
}

export const queryElement = <T>(selector: string | T) =>
  typeof selector === "string" ? (document.querySelector(selector) as any as T) : selector;

export function isStartNode<T extends { id: string }>(item: T) {
  return item.id === "0";
}
function findStatNode<T extends { id: string }>(nodes: T[]) {
  return nodes.find(isStartNode);
}

function findLogicNodes<T extends { id: string }>(nodes: T[]) {
  return nodes.filter((item) => !isStartNode(item));
}

export function toBlocNodes(list: BlocItem[]) {
  // this.addStartNode();
  const result = [];
  const startNode = findStatNode(list);
  if (startNode) {
    const node = new BlocStartNode({
      downstream: [...startNode.downstream_bloc_ids],
      upstream: [...startNode.upstream_bloc_ids],
      left: startNode.position.left || 500, //TODO
      top: startNode.position.top || 200, //TODO
    });
    result.push(node);
  }
  const nodes = findLogicNodes(list).map((bloc) => {
    const {
      id,
      bloc_id,
      downstream_bloc_ids,
      upstream_bloc_ids,
      note,
      position: { left, top },
    } = bloc;
    const node = new Bloc({
      blocId: bloc_id,
      name: note,
      id,
      downstream: [...downstream_bloc_ids],
      upstream: [...upstream_bloc_ids],
      left,
      top,
      lockMovementX: false,
      lockMovementY: false,
      // lockMovementX: this.canvas.viewOnly,
      // lockMovementY: this.canvas.viewOnly,
    });
    return node;
  });
  result.push(...nodes);
  return result;
}

export const resize = (canvas: Canvas) => {
  const el = canvas.getElement().parentElement as HTMLDivElement;
  if (!el) return;
  el.style.width = "100%";
  el.style.height = "100%";
  canvas.setWidth(el.offsetWidth);
  canvas.setHeight(el.offsetHeight);
};
