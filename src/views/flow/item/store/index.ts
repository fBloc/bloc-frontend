import { FunctionGroup, FunctionItem, getFunctions } from "@/api/bloc";
import { FlowDetailT, FlowRunningState } from "@/api/flow";
import { DetailType, EditType, isTruthyValue, Nullable } from "@/common";
import { BasicBloc, Bloc, BlocStartNode, ConnectionLine, isBlocNode, LogicNode } from "@/fabric/objects";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { Store } from "../../board/store";
import { Param } from "./param";
import { RunningEnum } from "@/common";
import { Request } from "./request";
import { findLogicNodeById, generateUniFlowIdentifier, toBlocNodes } from "@/fabric/tools";
import { createContext } from "react";

export class FlowItemStore extends Store<FlowDetailT> {
  param!: Param;
  request!: Request;
  private sourceFunctionId = "";
  @observable runningState: Nullable<FlowRunningState> = null;
  @observable functions: FunctionGroup[] = [];
  @computed get flattenFunctions() {
    return this.functions.reduce((acc: FunctionItem[], item) => [...acc, ...item.blocs], []);
  }
  get nodes() {
    const nodes = this.canvas?._objects.filter(isBlocNode) || [];
    const map = new Map<string, BasicBloc>();
    nodes.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }
  @computed get canRun() {
    return !!this.detail?.execute && !this.detail.is_draft;
  }
  @computed get canEdit() {
    return !!this.detail?.write;
  }
  @computed get isSuccess() {
    return this.runningState?.status === RunningEnum.success;
  }
  @computed get isRunning() {
    return this.runningState?.status === RunningEnum.running;
  }
  @computed get isFailed() {
    return this.runningState?.status === RunningEnum.failed;
  }
  /**
   * 当前是否空闲
   */
  @computed get isIdle() {
    return this.isSuccess || this.runningState?.status === RunningEnum.created || !this.runningState;
  }
  constructor() {
    super();
    makeObservable(this);
    this.param = new Param(this);
    this.request = new Request(this);
  }
  setSourceFunction(id: string) {
    this.sourceFunctionId = id;
  }
  private setCanvasTransform() {
    const detail = this.detail;
    if (!detail) return;
    const { left = 0, top = 0, zoom = 1 } = detail.position || { left: 0, top: 0, zoom: 1 };
    this.canvas?.setViewportTransform([zoom, 0, 0, zoom, left, top]);
  }
  renderNodes() {
    const blocs = Object.entries(this.detail?.blocs || {}).map(([id, item]) => ({
      ...item,
      id,
    }));
    super.preRenderNodes(
      toBlocNodes(blocs),
      () =>
        new BlocStartNode({
          left: 400,
          top: 200,
        }),
    );
  }
  async getFunctions() {
    const { data, isValid } = await getFunctions();
    if (isValid && data) {
      runInAction(() => {
        this.functions = data;
      });
    }
  }
  onLineClick = (line: ConnectionLine) => {
    this.param.show(line, EditType.edit);
  };
  @action setRunningState(state: FlowItemStore["runningState"]) {
    this.runningState = state;
  }
  generateNode() {
    const functionSource = this.flattenFunctions.find((item) => item.id === this.sourceFunctionId);
    if (!functionSource) return;
    const { id, name } = functionSource;
    return new Bloc({
      blocId: id,
      id: generateUniFlowIdentifier(),
      name,
    });
  }
  onDisconnect = <T extends LogicNode>(upstreamNode: T | undefined, downstreamNode: T | undefined) => {
    //
  };
  onConnect = (line: ConnectionLine) => {
    this.param.show(line, EditType.create);
  };
  onAddNode = (node: LogicNode) => {
    this.request.onNodesChange();
  };
  onNodeMoved = () => {
    this.request.onNodesChange();
  };
  onDetailChange = () => {
    this.request.disableSync = true;
    this.reset();
    this.render();
    this.setEvents(!this.editable);
    this.request.disableSync = false;
  };
  onRemoveNode = (node: fabric.IEvent["target"] | undefined) => {
    if (isBlocNode(node)) {
      const { downstream_bloc_ids } = node.getJson();
      const downsreamBlocIds = downstream_bloc_ids.filter(isTruthyValue) || [];
      const downstreamBlocNodes = downsreamBlocIds.map((item) => findLogicNodeById(this.canvas, item)).filter(isBlocNode);
      downstreamBlocNodes.forEach((item) => {
        item.paramIpts?.forEach((atoms) => {
          atoms.forEach((atom) => {
            if (atom && atom.flow_bloc_id === node.id) {
              atom.blank = true;
              atom.value = null;
              atom.flow_bloc_id = "";
            }
          });
        });
      });
      this.request.onNodesChange();
    }
  };
  onTransformed = () => {
    this.request.onTransform();
  };
  onZoomed = () => {
    const zoom = this.canvas?.getZoom() || 1;
    this.setZoom(zoom);
  };
  isShowDropHelper(e: fabric.IEvent) {
    const sourceFunction = this.flattenFunctions.find((item) => item.id === this.sourceFunctionId);
    const target = e.target;
    return {
      result: isBlocNode(target) && sourceFunction !== undefined,
      left: target?.left || 0,
      top: target?.top || 0,
    };
  }
  render() {
    this.setCanvasTransform();
    this.renderNodes();
    this.connectNodes();
  }
  onOriginIdChange = async () => {
    await this.request.fetchDetail(this.detailType);
    this.request.getRunningState();
  };
  async setup(el: HTMLCanvasElement | null) {
    this.createInstance(el);
    this.listenSecureEvents();
  }
  async toEditMode() {
    await this.request.fetchDetail(DetailType.draft);
    runInAction(() => {
      this.editable = true;
    });
  }
  async toReadMode() {
    await this.request.fetchDetail(DetailType.launched);
    runInAction(() => {
      this.editable = false;
    });
  }
}

export const StoreContext = createContext({} as FlowItemStore);
export const StoreProvider = StoreContext.Provider;
