import { FunctionGroup, FunctionItem, getFunctions } from "@/api/bloc";
import { BaseFlowItem, FlowDetailT, FlowRunningState, getHistoryFlow, ReadablePositionInfo } from "@/api/flow";
import { DetailType, EditType, isTruthyValue, Nullable } from "@/common";
import { BasicBloc, Bloc, BlocStartNode, ConnectionLine, isBlocNode, isLogicNode, LogicNode } from "@/fabric/objects";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { Store } from "../../board/store";
import { Param } from "./param";
import { RunningEnum } from "@/common";
import { Request } from "./request";
import { findLogicNodeById, generateUniFlowIdentifier, toBlocNodes } from "@/fabric/tools";
import { createContext } from "react";
import { useQuery } from "@/hooks";

export class FlowItemStore extends Store<BaseFlowItem<ReadablePositionInfo>> {
  param!: Param;
  request!: Request;
  private sourceFunctionId = "";
  @observable functions: FunctionGroup[] = [];
  @observable runningHistory: FlowRunningState[] = [];
  @observable currentHistory: Nullable<FlowRunningState> = null;
  @observable menuPopover = {
    open: false,
    left: 0,
    top: 0,
  };
  @observable nodeDrawerId = "";
  @observable nodeDrawerVisible = false;
  @computed get flattenFunctions() {
    return this.functions.reduce((acc: FunctionItem[], item) => [...acc, ...item.functions], []);
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
    return !!this.detail?.execute && !this.detail.is_draft && this.detail.pub_while_running;
  }
  @computed get canEdit() {
    return !!this.detail?.write && !this.detail.is_draft;
  }
  @computed get isSuccess() {
    return this.currentHistory?.status === RunningEnum.success;
  }
  @computed get isRunning() {
    return this.currentHistory?.status === RunningEnum.running;
  }
  @computed get isFailed() {
    return this.currentHistory?.status === RunningEnum.failed;
  }
  @computed get canUpdateSettings() {
    return this.detail?.super && !this.detail.is_draft && this.detail.version === 1; // 最新版
  }
  @computed get notLaunchedEver() {
    return this.detail === null;
  }
  /**
   * 当前是否空闲
   */
  @computed get isIdle() {
    return this.isSuccess || this.currentHistory?.status === RunningEnum.created || !this.currentHistory;
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
    const blocs = Object.entries(this.detail?.flowFunctionID_map_flowFunction || {}).map(([id, item]) => ({
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
    if (this.canvas?.spacebarPressed) return;
    this.param.show(line, EditType.edit);
  };
  onMouseUp = (e: fabric.IEvent) => {
    if (isLogicNode(e.target)) {
      const id = e.target.id;
      this.setNodeId(id);
      if (!this.editing) {
        this.showNodeDrawer();
        return;
      }
      const { left, width, top } = e.target.getBoundingRect();
      this.showMenuPopover({
        left: left + width / 2 - 50,
        top: top - 50,
      });
    }
    if (!isLogicNode(e.target)) {
      this.setNodeId("");
    }
  };
  onMouseDown = (e: fabric.IEvent) => {
    //
    this.hideMenuPopover();
  };
  @action setRunningHistory(history: FlowRunningState[]) {
    this.runningHistory = history;
    this.updateCurrentHistory();
  }
  updateCurrentHistory() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { version } = useQuery<{ version: string | undefined }>();
    if (version) {
      this.setCurrentHistory(this.runningHistory.find((item) => item.id === version));
    } else {
      this.setCurrentHistory(this.runningHistory.length > 0 ? this.runningHistory[0] : undefined);
    }
  }
  @action setCurrentHistory(history: FlowRunningState | undefined) {
    this.currentHistory = history || null;
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
    this.setEvents(!this.editing);
    this.request.disableSync = false;
  };
  onRemoveNode = (node: fabric.IEvent["target"] | undefined) => {
    if (isBlocNode(node)) {
      const { downstream_flowfunction_ids: downstream_bloc_ids } = node.getJson();
      const downsreamBlocIds = downstream_bloc_ids.filter(isTruthyValue) || [];
      const downstreamBlocNodes = downsreamBlocIds
        .map((item) => findLogicNodeById(this.canvas, item))
        .filter(isBlocNode);
      downstreamBlocNodes.forEach((item) => {
        item.paramIpts?.forEach((atoms) => {
          atoms.forEach((atom) => {
            if (atom && atom.flow_function_id === node.id) {
              atom.blank = true;
              atom.value = null;
              atom.flow_function_id = "";
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
    this.request.onTransform();
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
    if (this.detail?.is_draft === false) {
      this.request.getRunningHistory();
    }
  };
  async setup(el: HTMLCanvasElement | null) {
    this.createInstance(el);
    this.listenSecureEvents();
  }
  async toEditMode() {
    runInAction(() => {
      this.editing = true;
    });
    await this.request.fetchDetail(DetailType.draft);
  }
  async toReadMode() {
    runInAction(() => {
      this.editing = false;
    });
    await this.request.fetchDetail(DetailType.launched);
  }
  async switchHistory(flowId: string) {
    if (flowId === this.detail?.id) return;
    const { data } = await getHistoryFlow(flowId);
    runInAction(() => {
      this.detail = data;
    });
  }
  @action patchDetail<T extends keyof FlowDetailT>(key: T, value: FlowDetailT[T]) {
    if (this.detail) {
      this.detail[key] = value;
    }
  }
  @action setNodeId(id: string) {
    this.nodeDrawerId = id;
  }
  @action showMenuPopover(info: Partial<Omit<FlowItemStore["menuPopover"], "open">>) {
    this.menuPopover = {
      ...this.menuPopover,
      ...info,
      open: true,
    };
  }
  @action hideMenuPopover() {
    this.menuPopover.open = false;
  }
  onMenuClosed = () => {
    runInAction(() => {
      this.nodeDrawerId = "";
      this.menuPopover = {
        open: false,
        left: 0,
        top: 0,
      };
    });
  };
  @action showNodeDrawer() {
    this.nodeDrawerVisible = true;
  }
  @action closeNodeDrawer() {
    this.nodeDrawerVisible = false;
  }
}

export const StoreContext = createContext({} as FlowItemStore);
export const StoreProvider = StoreContext.Provider;
