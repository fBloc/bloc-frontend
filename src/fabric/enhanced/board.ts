import { fabric } from "fabric";
import { EventEmitter } from "@/common/EventEmitter";
import {
  Canvas,
  ConnectionLine,
  DropArea,
  isBlocNode,
  isConnectionLine,
  isLogicNode,
  isTriggerNode,
  LogicNode,
  NodeType,
  Trigger,
} from "@/fabric/objects";
import { CanvasEvents, defaultCoordinate } from "@/fabric/common";
import mapModule from "@/fabric/modules/map";
import { findLogicNodeById, isCircular, isSelection, isStartNode, queryElement, resize } from "@/fabric/tools";
import { nodeSettings } from "@/fabric/settings";
import { hotkeysPlugin, onResize, selectLine } from "@/fabric/modules";
import { Coordinate, Nullable, Position } from "@/common";

export interface BoardT {
  onDisconnect: (upstreamNode: LogicNode | undefined, downstream: LogicNode | undefined) => void;
  onRemoveNode: (target: fabric.Object | undefined) => void;
  onAddNode: (node: LogicNode) => void;
  onConnect: (line: ConnectionLine) => void;
  onZoomed: (e: fabric.IEvent) => void;
  onNodeMoved: (e: fabric.IEvent) => void;
  onLineClick: (line: ConnectionLine) => void;
  onMouseUp: (e: fabric.IEvent) => void;
  onMouseDown: (e: fabric.IEvent) => void;
  onTransformed: () => void;
  generateNode(): LogicNode | undefined;
  isShowDropHelper(e: fabric.IEvent): {
    result: boolean;
    left: number;
    top: number;
  };
}
export abstract class Board
  extends EventEmitter<{
    zoom: [number];
    lineClick: [ConnectionLine];
  }>
  implements BoardT
{
  abstract onDisconnect: (upstreamNode: LogicNode | undefined, downstream: LogicNode | undefined) => void;
  abstract onRemoveNode: (target: fabric.Object | undefined) => void;
  abstract onAddNode: (node: LogicNode) => void;
  abstract onConnect: (line: ConnectionLine) => void;
  abstract onZoomed: (e: fabric.IEvent) => void;
  abstract onLineClick: (line: ConnectionLine) => void;
  abstract onMouseUp: (e: fabric.IEvent) => void;
  abstract onMouseDown: (e: fabric.IEvent) => void;
  abstract onTransformed: () => void;
  abstract onNodeMoved: (e: fabric.IEvent) => void;
  abstract generateNode(): LogicNode | undefined;
  abstract isShowDropHelper(e: fabric.IEvent): {
    result: boolean;
    left: number;
    top: number;
  };
  private instance?: Canvas;
  private connectingLine?: ConnectionLine;
  private dropArea?: DropArea;
  private removeOnMouseMove = () => {
    this.instance?.off(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
  };
  private prepareDrawLine(target: Trigger) {
    if (!this.instance) return;
    const host = target.host;
    const { left = 0, top = 0 } = host;
    const line = new ConnectionLine([left, top, left, top], {
      upstream: host.id,
    });
    this.connectingLine = line;
    this.instance?.add(line);
    this.instance.bringToFront(this.instance.trigger!);
    this.instance.selection = false;
  }
  private updateConnectingLine(e: fabric.IEvent) {
    const { x, y } = e.absolutePointer || defaultCoordinate;
    this.connectingLine?.updateEndPoint(x - nodeSettings.width / 2, y);
    this.instance?.renderAll();
  }
  private onMouseMove = (e: fabric.IEvent) => {
    this.removeDropArea();
    if (!this.connectingLine || !this.instance) return;
    this.updateConnectingLine(e);
    let valid = false;
    if (isBlocNode(e.target)) {
      const destIsSelf = this.connectingLine.upstream === e.target?.id;
      const circular = isCircular(this.instance, e.target.id, this.connectingLine.upstream || "");
      const isDestSystemNode = e.target.nodeType === NodeType.system;
      valid = !destIsSelf && !circular && !isDestSystemNode;
    }
    if (valid) {
      this.showDropArea({
        left: e.target?.left || 0,
        top: e.target?.top || 0,
        text: "松开手指",
      });
    }
    this.connectingLine.isValid = valid;
  };
  setEvents(readonly: boolean) {
    this.instance?.setReadonly(readonly);
    if (readonly) {
      this.offEffectiveEvents();
    } else {
      this.listenEffectiveEvents();
    }
  }
  private doneConnectingLine(e: fabric.IEvent) {
    const line = this.connectingLine;
    if (line && this.instance) {
      let isLineValid = false;
      if (isLogicNode(e.target) && this.connectingLine?.isValid) {
        const downstream = e.target.id;
        this.connectingLine?.setDownstream(downstream);
        const dNode = findLogicNodeById(this.instance, line.upstream!);
        isLineValid = !dNode?.downstream.includes(downstream);
      }
      if (isLineValid) {
        line.normalizePoints();
        this.onConnect(line); // 只是ui层面连接，并未进行数据关联
      } else {
        this.instance.remove(line);
      }
    }
    this.removeDropArea();
    this.connectingLine = undefined;
  }
  private showDropArea(options: ConstructorParameters<typeof DropArea>[0]) {
    if (!this.dropArea) {
      this.dropArea = new DropArea(options);
      this.dropArea && this.instance?.add(this.dropArea);
    }
    this.dropArea?.setOptions(options);
    this.dropArea?.setCoords();
  }
  get startNode() {
    return this.instance?._objects.filter(isLogicNode).find(isStartNode);
  }
  get canvas() {
    return this.instance;
  }
  removeDropArea() {
    this.dropArea && this.instance?.remove(this.dropArea);
    this.dropArea = undefined;
  }
  createInstance(...args: ConstructorParameters<typeof fabric.Canvas>) {
    if (this.instance) {
      resize(this.instance);
      return;
    }
    const [element, options] = args;
    const el = queryElement(element);

    if (!el) return;
    el.style.width = "100%";
    el.style.height = "100%";
    this.instance = new Canvas(element, {
      width: el.offsetWidth,
      height: el.offsetHeight,
      ...options,
    });
    this.instance.hoverCursor = "grab";
    this.instance.defaultCursor = "grab";
    this.instance.use(mapModule).use(selectLine).use(hotkeysPlugin).use(onResize);
    resize(this.instance!);
  }
  renderNodes<R extends LogicNode>(nodes: R[]) {
    nodes.forEach((node) => {
      this.instance?.add(node);
    });
    this.instance?.renderAll();
  }
  connectNodes() {
    const nodes = this.instance?._objects.filter(isLogicNode) || [];
    nodes.forEach((node) => {
      node.drawInlines();
    });
  }
  reset() {
    this.instance?.reset();
  }
  private onPrivateMouseUp = (e: fabric.IEvent) => {
    this.doneConnectingLine(e);
    this.onMouseUp(e);
  };
  private onLineClicked = (e: fabric.IEvent) => {
    if (isConnectionLine(e.target)) {
      this.onLineClick(e.target);
    }
  };
  private onPrivateMouseDown = (e: fabric.IEvent) => {
    const target = e.target;
    if (isTriggerNode(target)) {
      this.instance?.setActiveObject(target.host);
      this.instance?.on(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
      this.instance?.on(CanvasEvents.CANVAS_MOUSE_UP, this.removeOnMouseMove);
      this.prepareDrawLine(target);
    }
    this.onMouseDown(e);
    if (target) return; // TODO explain why return
    this.instance?.discardActiveObject();
  };
  onBoardDestroy() {
    this.canvas?.reset();
    this.offSecureEvents();
    this.offEffectiveEvents();
    this.instance = undefined;
  }
  listenSecureEvents() {
    const instance = this.instance;
    if (!instance) return;
    instance.on(CanvasEvents.CANVAS_MOUSE_UP, this.onPrivateMouseUp);
    instance.on(CanvasEvents.LINE_CLICKED, this.onLineClicked);
    instance.on(CanvasEvents.ZOOMED, this.onZoomed);
  }
  offSecureEvents() {
    const instance = this.instance;
    if (!instance) return;
    instance.off(CanvasEvents.CANVAS_MOUSE_UP, this.onPrivateMouseUp);
    instance.off(CanvasEvents.LINE_CLICKED, this.onLineClicked);
    instance.off(CanvasEvents.ZOOMED, this.onZoomed);
  }
  setTranslate({ x, y }: Coordinate) {
    const transform = this.instance?.viewportTransform;
    if (!transform) return;
    transform[4] = x;
    transform[5] = y;
    this.instance?.setViewportTransform(transform);
  }
  private movement({ x, y }: Coordinate) {
    let start: Nullable<number> = null;
    const duration = 200;
    const { x: _x, y: _y } = this.instance?.viewportTranslate || defaultCoordinate;
    const diffX = x - _x;
    const diffY = y - _y;
    let frame = -1;
    const step = (now: number) => {
      if (!start) {
        start = now;
      }
      const percentage = (now - start) / duration;
      this.setTranslate({
        x: _x + percentage * diffX,
        y: _y + percentage * diffY,
      });
      if (now - start > duration) {
        window.cancelAnimationFrame(frame);
      } else {
        frame = window.requestAnimationFrame(step);
      }
    };
    frame = window.requestAnimationFrame(step);
  }
  focusNode(node: LogicNode) {
    const { left, top, width: w, height: h } = node.getBoundingRect();
    const width = this.instance?.getWidth() || 0;
    const height = this.instance?.getHeight() || 0;
    const isXOverfow = left + w > width;
    const isYOverflow = top + h > height;
    if (isXOverfow || isYOverflow) {
      const transform = this.instance?.viewportTransform;
      if (!transform) return;
      const [, , , , x, y] = transform;
      this.movement({
        x: isXOverfow ? x - (left - width) - 20 - w : x,
        y: isYOverflow ? y - (top - height) - 20 - h : y,
      });
    }
    node.bringToFront();
    this.instance?.setActiveObject(node);
  }
  private establishConnection(e: fabric.IEvent, downstreamNode: LogicNode) {
    downstreamNode.setOptions({
      left: e.target?.left || 0,
      top: (e.target?.top || 0) + (e.target?.height || 0) + 80,
    });
    downstreamNode.setCoords();
    this.focusNode(downstreamNode);
    const upstreamNode = e.target as LogicNode;
    this.addLineConnection(upstreamNode, downstreamNode);
  }
  onDragOver = (e: fabric.IEvent) => {
    const event = e.e as DragEvent;
    if (!event.dataTransfer) return;
    const { result, left, top } = this.isShowDropHelper(e);
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    this.removeDropArea();
    if (result) {
      this.showDropHelper({ left, top });
    }
  };
  private addLineConnection(upstream: LogicNode, downstream: LogicNode) {
    const upstreamId = upstream.id;
    const downstreamId = downstream.id;
    if (!upstreamId || !downstreamId || upstreamId === downstreamId) return;
    const { left = 0, top = 0 } = upstream;
    const { left: uLeft = 0, top: uTop = 0 } = downstream;
    const line = new ConnectionLine([left, top, uLeft, uTop], {
      upstream: upstreamId,
      downstream: downstreamId,
    });
    upstream.registerDownstream(line);
    downstream.registerUpstream(line);
    this.instance?.add(line);
    line.registerNodes();
    this.instance?.renderAll();
  }
  private onObjectMove = (e: fabric.IEvent) => {
    //
  };
  private showDropHelper(position: Position) {
    this.showDropArea({
      ...position,
      text: "作为其下游",
    });
  }
  onDrop = (e: fabric.IEvent) => {
    const downstreamNode = this.generateNode();
    if (!downstreamNode) return;
    const { x, y } = this.instance?.getPointer(e.e) || defaultCoordinate;
    downstreamNode.setOptions({
      left: x,
      top: y,
    });
    this.instance?.add(downstreamNode);
    this.removeDropArea();
    this.onAddNode(downstreamNode);
    if (isLogicNode(e.target)) {
      this.establishConnection(e, downstreamNode);
    }
    this.instance?.setActiveObject(downstreamNode);
  };
  private onObjectRemoved = (e: fabric.IEvent) => {
    const target = e.target;
    if (isLogicNode(target)) {
      this.onRemoveNode(e.target);
    }
    if (isConnectionLine(target)) {
      this.onDisconnect(target.upstreamNode, target.downstreamNode);
    }
    this.instance?.discardActiveObject();
  };
  private onSelectionCreated = (e: fabric.IEvent) => {
    const target = e.target;
    if (!isSelection(target)) return;
    target.hasControls = false;
    target.on(CanvasEvents.OBJECT_MOVING, () => {
      const nodes = target._objects.filter(isLogicNode);
      nodes.forEach((node) => {
        node.onMoving();
      });
    });
  };
  private onSelectionUpdated = () => {
    //
  };
  private onSelectionCleared = (e: fabric.IEvent) => {
    //
  };
  listenEffectiveEvents() {
    const canvas = this.instance;
    if (!canvas) return;
    canvas.on(CanvasEvents.TRANSFORMED, this.onTransformed);
    canvas.on(CanvasEvents.DROP, this.onDrop);
    canvas.on(CanvasEvents.DRAG_OVER, this.onDragOver);
    canvas.on(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
    canvas.on(CanvasEvents.CANVAS_OBJECT_MOVING, this.onObjectMove);
    canvas.on(CanvasEvents.CANVAS_OBJECT_MOVED, this.onNodeMoved);
    canvas.on(CanvasEvents.OBJECT_REMOVED, this.onObjectRemoved);
    canvas.on(CanvasEvents.SELECTION_CREATED, this.onSelectionCreated);
    canvas.on(CanvasEvents.SELECTION_UPDATED, this.onSelectionUpdated);
    canvas.on(CanvasEvents.SELECTION_CLEARED, this.onSelectionCleared);
    canvas.on(CanvasEvents.CANVAS_MOUSE_DOWN, this.onPrivateMouseDown);
  }
  offEffectiveEvents() {
    const canvas = this.instance;
    if (!canvas) return; // TODO
    canvas.on(CanvasEvents.TRANSFORMED, this.onTransformed);
    canvas.off(CanvasEvents.DROP, this.onDrop);
    canvas.off(CanvasEvents.DRAG_OVER, this.onDragOver);
    canvas.off(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
    canvas.off(CanvasEvents.CANVAS_OBJECT_MOVING, this.onObjectMove);
    canvas.off(CanvasEvents.CANVAS_OBJECT_MOVED, this.onNodeMoved);
    canvas.off(CanvasEvents.OBJECT_REMOVED, this.onObjectRemoved);
    canvas.off(CanvasEvents.SELECTION_CREATED, this.onSelectionCreated);
    canvas.off(CanvasEvents.SELECTION_UPDATED, this.onSelectionUpdated);
    canvas.off(CanvasEvents.SELECTION_CLEARED, this.onSelectionCleared);
    canvas.off(CanvasEvents.CANVAS_MOUSE_DOWN, this.onPrivateMouseDown);
  }
  getReadableTransformInfo() {
    const { x: left, y: top } = this.instance?.viewportTranslate || defaultCoordinate;
    return {
      left,
      top,
      zoom: this.instance?.getZoom() || 1,
    };
  }
}
