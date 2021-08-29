import { fabric } from "fabric";
import { action, IReactionDisposer, makeObservable, observable, reaction, when } from "mobx";
import { CanvasEvents } from "@/fabric/common";
import { defaultCoordinate, Coordinate, Position, Nullable } from "@/common";

import {
  Canvas,
  ConnectionLine,
  DropArea,
  ICanvasOptions,
  isConnectionLine,
  isLogicNode,
  isTriggerNode,
  LogicNode,
  NodeType,
  Trigger,
} from "../objects";
import { nodeSettings } from "@/fabric/settings";
import { isCircular } from "@/fabric/tools";
import { hotkeysPlugin, map, selectLine } from "../modules";

function isSelection(target: unknown): target is fabric.ActiveSelection {
  return target instanceof fabric.ActiveSelection;
}

export class Board {
  @observable canvas?: Canvas;
  @observable viewOnly = false;
  @observable host?: HTMLCanvasElement = undefined;
  private diposers: IReactionDisposer[] = [];
  private dropArea?: DropArea;
  private connectingLine?: ConnectionLine;
  private isMovedAfterMouseDown = false;
  @observable hotkeysDisabled = true;
  spacebarPressed = false;
  constructor() {
    makeObservable(this);
    const disposer = reaction(
      () => this.viewOnly,
      (viewOnly) => {
        if (viewOnly) {
          this.offEffectiveEvents();
          this.removeTrigger();
        } else {
          this.listenEffectiveEvents();
        }
      },
    );
    this.diposers.push(disposer);
  }
  createInstance(options?: ICanvasOptions) {
    if (!this.host) return;
    const instance = new Canvas(this.host, {
      selectionColor: "rgba(0, 145, 255, 0.1)",
      selectionBorderColor: "#0091FF",
      preserveObjectStacking: true,
      width: this.host.offsetWidth,
      height: this.host.offsetHeight,
      ...options,
    });
    this.setInstance(instance);
    this.listenSecureEvents();
    instance?.use(hotkeysPlugin).use(selectLine).use(map);
    return instance;
  }
  @action private setInstance(instance: Canvas) {
    this.canvas = instance;
    const disposer = when(
      () => !this.canvas,
      () => {
        this.diposers.forEach((disposer) => disposer());
        this.diposers = [];
        disposer();
      },
    );
  }
  @action setViewOnly(viewOnly: boolean) {
    if (!this.canvas) return;
    this.viewOnly = viewOnly;
    this.canvas.setReadonly(viewOnly);
  }
  @action setHotkeysDisabled(disabled: boolean) {
    this.hotkeysDisabled = disabled;
  }
  private establishConnection(e: fabric.IEvent, downstreamNode: LogicNode) {
    // const canConnect = this.root.bridge.isUpstream(e.target);
    const canConnect = true;
    if (!canConnect) return;
    downstreamNode.setOptions({
      left: e.target?.left || 0,
      top: (e.target?.top || 0) + (e.target?.height || 0) + 80,
    });
    downstreamNode.setCoords();
    this.focusNode(downstreamNode);
    const upstreamNode = e.target as LogicNode;
    this.addLineConnection(upstreamNode, downstreamNode);
  }
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
    this.canvas?.add(line);
    line.registerNodes();
    this.canvas?.renderAll();
  }
  onDrop = (e: fabric.IEvent) => {
    // const downstreamNode = this.root.bridge.generateNode();
    const downstreamNode = {} as any; // TODO
    const { x, y } = this.canvas?.getPointer(e.e) || defaultCoordinate;
    downstreamNode.setOptions({
      left: x,
      top: y,
    });
    this.canvas?.add(downstreamNode);
    this.removeDropArea();
    this.root.bridge.onNodeAdded(downstreamNode); // TODO 除添加，还有连接事件
    this.establishConnection(e, downstreamNode);
    this.canvas?.setActiveObject(downstreamNode);
  };
  private onMouseDown = (e: fabric.IEvent) => {
    if (!e.target) {
      this.removeTrigger();
      this.canvas?._objects.forEach((node) => {
        if (isLogicNode(node) && node.selected) {
          node.selected = false;
        }
      });
    }
    if (isTriggerNode(e.target)) {
      this.readyDrawConnectingLine(e.target);
    }
    this.isMovedAfterMouseDown = false;
    this.root.bridge.onMouseDown(e);
  };
  private readyDrawConnectingLine(target: Trigger) {
    if (!this.canvas) return;
    const host = target.host;
    const { left = 0, top = 0 } = host;
    const line = new ConnectionLine([left, top, left, top], {
      upstream: host.id,
    });
    this.connectingLine = line;
    this.canvas?.add(line);
    this.canvas.selection = false;
  }
  private updateConnectingLine(e: fabric.IEvent) {
    const { x, y } = e.absolutePointer || defaultCoordinate;
    this.connectingLine?.updateEndPoint(x - nodeSettings.width / 2, y);
    this.canvas?.renderAll();
  }
  private doneConnectingLine(e: fabric.IEvent) {
    const line = this.connectingLine;
    if (!line || !this.canvas) return;
    if (isLogicNode(e.target)) {
      this.connectingLine?.setDownstream(e.target.id);

      line.registerNodes();
      if (line.upstreamNode && line.downstreamNode) {
        this.root.bridge.onConnect(line);
      }
      const trigger = this.canvas.trigger;
      if (trigger) {
        this.canvas?.bringToFront(trigger);
      }
    } else {
      line.destroy();
    }
    this.removeDropArea();
    this.connectingLine = undefined;
  }
  private onMouseUp = (e: fabric.IEvent) => {
    if (!this.isMovedAfterMouseDown) {
      this.onPureClick(e);
    }
    if (this.connectingLine) {
      this.doneConnectingLine(e);
    }
  };
  private onPureClick(e: fabric.IEvent) {
    this.root.bridge.onPureClick(e);
  }
  private onLineClicked = (e: fabric.IEvent) => {
    if (isConnectionLine(e.target)) {
      e.target.focus();
      // this.root.bridge.onClickConnectionLine(e.target);
    }
  };
  private removeTrigger() {
    if (!this.canvas) return;
    if (this.canvas.trigger?.host) {
      this.canvas.trigger.host.selected = false;
    }
    this.canvas.trigger?.destroy();
    this.canvas.trigger = undefined;
  }
  private onMouseMove = (e: fabric.IEvent) => {
    this.isMovedAfterMouseDown = true;
    if (!this.connectingLine || !this.canvas) return;
    const circular =
      isLogicNode(e.target) && isCircular(this.canvas, e.target.id, this.connectingLine.upstreamNode?.id || "");
    const isDestSystemNode = isLogicNode(e.target) && e.target.nodeType === NodeType.system;
    this.updateConnectingLine(e);
    const { result, left, top } = this.root.bridge.isShowLineDropHelper(e);
    const destIsSelf = this.connectingLine.upstreamNode === e.target;
    const canConnect = !destIsSelf && !circular && !isDestSystemNode;
    if (result && canConnect) {
      this.showDropArea({
        left,
        top,
        text: "松开手指",
      });
    } else {
      this.removeDropArea();
    }
  };
  onObjectMove = (e: fabric.IEvent) => {
    this.root.bridge.onNodesMoved();
  };
  onObjectRemoved = (e: fabric.IEvent) => {
    const target = e.target;
    if (isLogicNode(target)) {
      this.root.bridge.onNodesRemoved(e.target);
    }
    if (isConnectionLine(target)) {
      this.root.bridge.onDisconnect(target.upstreamNode, target.downstreamNode);
    }
    this.canvas?.discardActiveObject();
  };
  onZoomed = () => {
    this.root.bridge.onCanvasSettingsChange();
  };
  onTransformed = () => {
    this.root.bridge.onCanvasSettingsChange();
  };
  onDragOver = (e: fabric.IEvent) => {
    const event = e.e as DragEvent;
    if (!event.dataTransfer) return;
    const { result, left, top } = this.root.bridge.isShowDropHelper(e);
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    this.removeDropArea();
    if (result) {
      this.showDropHelper({ left, top });
    }
  };
  private showDropHelper(position: Position) {
    this.showDropArea({
      ...position,
      text: "作为其下游",
    });
  }
  private onSelectionUpdated = () => {
    //
  };
  private onSelectionCleared = (e: fabric.IEvent) => {
    //
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
  listenSecureEvents() {
    this.canvas?.on(CanvasEvents.CANVAS_MOUSE_UP, this.onMouseUp);
    this.canvas?.on(CanvasEvents.LINE_CLICKED, this.onLineClicked);
    this.canvas?.on(CanvasEvents.CANVAS_MOUSE_DOWN, this.onMouseDown);
    this.canvas?.on(CanvasEvents.TRANSFORMED, this.onTransformed);
    this.canvas?.on(CanvasEvents.ZOOMED, this.onZoomed);
  }
  listenEffectiveEvents() {
    const canvas = this.canvas;
    if (!canvas) return;
    canvas.on(CanvasEvents.DROP, this.onDrop);
    canvas.on(CanvasEvents.DRAG_OVER, this.onDragOver);
    canvas.on(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
    canvas.on(CanvasEvents.CANVAS_OBJECT_MOVING, this.onObjectMove);
    canvas.on(CanvasEvents.OBJECT_REMOVED, this.onObjectRemoved);
    canvas.on(CanvasEvents.SELECTION_CREATED, this.onSelectionCreated);
    canvas.on(CanvasEvents.SELECTION_UPDATED, this.onSelectionUpdated);
    canvas.on(CanvasEvents.SELECTION_CLEARED, this.onSelectionCleared);
    const disposer = reaction(
      () => this.hotkeysDisabled,
      (disabled) => {
        this.canvas && (this.canvas.disableHotkeys = disabled);
      },
    );
    this.diposers.push(disposer);
  }
  offSecureEvents() {
    this.canvas?.off(CanvasEvents.LINE_CLICKED, this.onLineClicked);
    this.canvas?.off(CanvasEvents.CANVAS_MOUSE_UP, this.onMouseUp);
    this.canvas?.off(CanvasEvents.CANVAS_MOUSE_DOWN, this.onMouseDown);
    this.canvas?.off(CanvasEvents.TRANSFORMED, this.onTransformed);
    this.canvas?.off(CanvasEvents.ZOOMED, this.onZoomed);
  }
  offEffectiveEvents() {
    const canvas = this.canvas;
    if (!canvas) return; // TODO

    canvas.off(CanvasEvents.DROP, this.onDrop);
    canvas.off(CanvasEvents.DRAG_OVER, this.onDragOver);
    canvas.off(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
    canvas.off(CanvasEvents.CANVAS_OBJECT_MOVING, this.onObjectMove);
    canvas.off(CanvasEvents.OBJECT_REMOVED, this.onObjectRemoved);

    canvas.off(CanvasEvents.SELECTION_CREATED, this.onSelectionCreated);
    canvas.off(CanvasEvents.SELECTION_UPDATED, this.onSelectionUpdated);
    canvas.off(CanvasEvents.SELECTION_CLEARED, this.onSelectionCleared);
  }
  private removeDropArea() {
    this.dropArea && this.canvas?.remove(this.dropArea);
    this.dropArea = undefined;
  }
  private removeConnectingLine() {
    this.connectingLine && this.canvas?.remove(this.connectingLine);
    this.connectingLine = undefined;
  }
  private showDropArea(options: ConstructorParameters<typeof DropArea>[0]) {
    if (!this.dropArea) {
      this.dropArea = new DropArea(options);
      this.dropArea && this.canvas?.add(this.dropArea);
    }
    this.dropArea?.setOptions(options);
    this.dropArea?.setCoords();
  }
  private movement({ x, y }: Coordinate) {
    let start: Nullable<number> = null;
    const duration = 200;
    const { x: _x, y: _y } = this.canvas?.viewportTranslate || defaultCoordinate;
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
    const width = this.canvas?.getWidth() || 0;
    const height = this.canvas?.getHeight() || 0;
    const isXOverfow = left + w > width;
    const isYOverflow = top + h > height;
    if (isXOverfow || isYOverflow) {
      const transform = this.canvas?.viewportTransform;
      if (!transform) return;
      const [, , , , x, y] = transform;
      this.movement({
        x: isXOverfow ? x - (left - width) - 20 - w : x,
        y: isYOverflow ? y - (top - height) - 20 - h : y,
      });
    }
    node.bringToFront();
    this.canvas?.setActiveObject(node);
  }
  getReadableTransformInfo() {
    const { x: left, y: top } = this.canvas?.viewportTranslate || defaultCoordinate;
    return {
      left,
      top,
      zoom: this.canvas?.getZoom() || 1,
    };
  }
  restoreTransform({ left, top, zoom }: Record<"left" | "top" | "zoom", number>) {
    const _zoom = zoom ?? 1;
    const _left = left ?? 0;
    const _top = top ?? 0;
    this.canvas?.setViewportTransform([_zoom, 0, 0, _zoom, _left, _top]);
    this.canvas?.setZoom(_zoom);
  }
  findLogicNode(id: string) {
    const objects = this.canvas?._objects || [];
    return objects.find((item) => isLogicNode(item) && item.id === id) as LogicNode;
  }
  setTranslate({ x, y }: Coordinate) {
    const transform = this.canvas?.viewportTransform;
    if (!transform) return;
    transform[4] = x;
    transform[5] = y;
    this.canvas?.setViewportTransform(transform);
  }
  resetTranslate() {
    this.setTranslate({ x: 0, y: 0 });
  }
  reset() {
    this.canvas?.clear();
  }
  @action destroy() {
    this.reset();
    this.canvas = undefined;
  }
}
