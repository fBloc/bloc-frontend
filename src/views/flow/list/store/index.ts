import { createContext } from "react";
import { fabric } from "fabric";
import { makeObservable, reaction, observable, action, IReactionDisposer, computed } from "mobx";
import { FlowRunningState, IBloc, IFlow } from "@/api/flow";
import { BlocGroup, Nullable } from "@/common";
import { Request } from "./request";
import { EventEmitter } from "@/common/EventEmitter";
import {
  Bloc,
  BlocStartNode,
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
import { findLogicNodeById, isCircular } from "@/fabric/tools";
import { nodeSettings } from "@/fabric/settings";

const selectElement = <T>(selector: string | T) =>
  typeof selector === "string" ? (document.querySelector(selector) as any as T) : selector;

function isStart<T extends { id: string }>(item: T) {
  return item.id === "0";
}
function findStatNode<T extends { id: string }>(nodes: T[]) {
  return nodes.find(isStart);
}

function findLogicNodes<T extends { id: string }>(nodes: T[]) {
  return nodes.filter((item) => !isStart(item));
}

function toFlowNodes(list: IBloc[]) {
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

class Board extends EventEmitter<{
  zoom: [number];
}> {
  private instance?: Canvas;
  private connectingLine?: ConnectionLine;
  private dropArea?: DropArea;
  private initEvents() {
    this.instance?.on(CanvasEvents.CANVAS_MOUSE_DOWN, this.blur);
  }
  private blur = (e: fabric.IEvent) => {
    const target = e.target;
    if (isTriggerNode(target)) {
      this.instance?.setActiveObject(target.host);
      this.instance?.on(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
      this.instance?.on(CanvasEvents.CANVAS_MOUSE_UP, this.removeOnMouseMove);

      this.prepareDrawLine(target);
    }
    if (target) return;
    this.instance?.discardActiveObject();
  };
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
    if (!this.connectingLine || !this.instance) return;
    const circular =
      isLogicNode(e.target) && isCircular(this.instance, e.target.id, this.connectingLine.upstreamNode?.id || "");
    const isDestSystemNode = isLogicNode(e.target) && e.target.nodeType === NodeType.system;
    this.updateConnectingLine(e);
    // const { result, left, top } = this.root.bridge.isShowLineDropHelper(e);
    const destIsSelf = this.connectingLine.upstreamNode === e.target;
    const canConnect = !destIsSelf && !circular && !isDestSystemNode;
    if (isBlocNode(e.target) && canConnect) {
      this.showDropArea({
        left: e.target?.left || 0,
        top: e.target?.top || 0,
        text: "松开手指",
      });
    } else {
      this.removeDropArea();
    }
  };
  private doneConnectingLine(e: fabric.IEvent) {
    const line = this.connectingLine;
    if (line && this.instance) {
      let isLineValid = false;
      if (isLogicNode(e.target)) {
        const downstream = e.target.id;
        this.connectingLine?.setDownstream(downstream);
        const dNode = findLogicNodeById(this.instance, line.upstream!);
        isLineValid = !dNode?.downstream.includes(downstream);
      }
      if (isLineValid) {
        line.normalizePoints();
        line.work();
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
  removeDropArea() {
    this.dropArea && this.instance?.remove(this.dropArea);
    this.dropArea = undefined;
  }
  createInstance(...args: ConstructorParameters<typeof fabric.Canvas>) {
    if (this.instance) return;
    const [element, options] = args;
    const el = selectElement(element);
    if (!el) return;
    el.style.width = "100%";
    el.style.height = "100%";
    this.instance = new Canvas(element, {
      width: el.offsetWidth,
      height: el.offsetHeight,
      ...options,
    });
    this.initEvents();
    this.listenSecureEvents();
    this.instance.use(mapModule);
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
  private onMouseUp = (e: fabric.IEvent) => {
    // this.instance?.off(CanvasEvents.CANVAS_MOUSE_MOVE, this.onMouseMove);
    this.doneConnectingLine(e);
  };
  private onLineClicked = (e: fabric.IEvent) => {
    if (isConnectionLine(e.target)) {
      e.target.focus();
      // this.root.bridge.onClickConnectionLine(e.target);
    }
  };
  private onMouseDown = (e: fabric.IEvent) => {
    //
  };
  private onTransformed = (e: fabric.IEvent) => {
    //
  };
  private onZoomed = (e: fabric.IEvent) => {
    const zoom = this.instance?.getZoom();
    this.emit("zoom", zoom || 1);
  };
  listenSecureEvents() {
    const instance = this.instance;
    if (!instance) return;
    instance.on(CanvasEvents.CANVAS_MOUSE_UP, this.onMouseUp);
    instance.on(CanvasEvents.LINE_CLICKED, this.onLineClicked);
    instance.on(CanvasEvents.CANVAS_MOUSE_DOWN, this.onMouseDown);
    instance.on(CanvasEvents.TRANSFORMED, this.onTransformed);
    instance.on(CanvasEvents.ZOOMED, this.onZoomed);
  }
}

class Ui {
  @observable zoom = 1;
  @computed get intZoom() {
    return parseInt(`${this.zoom * 100}`);
  }
  constructor(private root: Store) {
    makeObservable(this);
  }
  @computed get zoomOutDisabled() {
    return this.intZoom <= 10;
  }
  @computed get zoomInDisabled() {
    return this.intZoom >= 200;
  }
  @action setZoom(value: number) {
    this.zoom = value;
  }
}

export class Store {
  @observable detail: Nullable<IFlow> = null;
  @observable runningState: Nullable<FlowRunningState> = null;
  @observable blocs: BlocGroup[] = [];
  private disposers: IReactionDisposer[] = [];
  private board!: Board;
  @observable originId: string = "";
  request!: Request;
  ui!: Ui;
  constructor() {
    makeObservable(this);
    this.request = new Request(this);
    this.disposers.push(reaction(() => this.detail, this.onDetailChange));
    this.disposers.push(reaction(() => this.originId, this.onOriginIdChange));
    this.board = new Board();
    this.ui = new Ui(this);
    this.board.on("zoom", this.onZoom);
  }
  private onDetailChange = () => {
    this.renderNodes();
    this.connectNodes();
  };
  private renderNodes() {
    const blocs = Object.entries(this.detail?.blocs || {}).map(([id, item]) => ({
      ...item,
      id,
    }));
    const nodes: LogicNode[] = toFlowNodes(blocs);
    this.board.renderNodes(nodes);
  }
  private connectNodes() {
    this.board.connectNodes();
  }
  private onOriginIdChange = () => {
    this.board.reset();
  };
  @action setOriginId(id: string) {
    this.originId = id;
  }
  @action setDetail(detail: Store["detail"]) {
    this.detail = detail;
  }
  @action setRunningState(state: Store["runningState"]) {
    this.runningState = state;
  }
  private onZoom = (value: number) => {
    this.ui.setZoom(value);
  };
  getDrafDetail() {
    //
  }
  toViewMode() {
    //
  }
  toEditMode() {
    //
  }
  @action setBlocs(blocs: BlocGroup[]) {
    this.blocs = blocs;
  }
  async render(el: HTMLCanvasElement | null, originId: string) {
    this.board.createInstance(el);
    await this.request.fetchDetail(originId, "detail");
    this.request.getRunningState();
  }
}

export const StoreContext = createContext({} as Store);

export const StoreProvider = StoreContext.Provider;
