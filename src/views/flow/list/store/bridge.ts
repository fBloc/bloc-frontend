import { NodeBridge } from "@/fabric/enhanced/bridge";
import { Bloc, ConnectionLine, isBlocNode, isLogicNode, LogicNode } from "@/fabric/objects";
import { generateUniFlowIdentifier } from "@/fabric/tools";
import { Store } from ".";
import { fabric } from "fabric";
export enum EditType {
  create = "create",
  edit = "edit",
}

export class FlowBridge extends NodeBridge {
  private tempLine?: ConnectionLine;
  constructor(private root: Store) {
    super();
  }
  get canvas() {
    return this.root.canvas;
  }
  submitConnection() {
    if (!this.tempLine) return;
    const canvas = this.canvas.instance;
    const { upstream, downstream } = this.tempLine;
    if (!canvas || !downstream || !upstream) return;
    this.tempLine.work();
    this.root.request.updateNodes();
    this.root.params.setSetterVisible(false);
  }
  cancelConnection() {
    if (!this.tempLine) return;
    this.tempLine.destroy();
    this.root.request.updateNodes();
  }
  addNode() {
    this.canvas.instance?.add();
  }
  removeNode() {
    this.canvas.instance?.remove();
  }
  onConnect(line: ConnectionLine) {
    if (!line || !line.upstream || !line.downstream) return;
    line.normalizePoints();
    this.tempLine = line;
    this.root.params.show(line.upstream, line.downstream, EditType.create);
  }
  disConnect() {
    //
  }
  onMouseDown(e: fabric.IEvent) {
    if (!isLogicNode(e.target)) {
      this.root.ui.hideMenuPopover();
    }
  }
  isShowDropHelper(e: fabric.IEvent) {
    const { groupIndex, index } = this.root.blocSource;
    const target = e.target;
    return {
      result: isBlocNode(target) && groupIndex >= 0 && index >= 0,
      left: target?.left || 0,
      top: target?.top || 0,
    };
  }
  isUpstream(node: unknown) {
    return isBlocNode(node);
  }
  isShowLineDropHelper(e: fabric.IEvent) {
    return {
      result: isBlocNode(e.target),
      left: e.target?.left || 0,
      top: e.target?.top || 0,
    };
  }
  generateNode() {
    const { groupIndex, index } = this.root.blocSource;
    const group = this.root.request.functions;
    const { id, name } = group[groupIndex].blocs[index];
    return new Bloc({
      blocId: id,
      id: generateUniFlowIdentifier(),
      name,
    });
  }
  onNodesMoved() {
    this.root.request.updateNodes();
    this.root.ui.hideMenuPopover();
  }
  onNodesRemoved(node: unknown) {
    if (isBlocNode(node)) {
      this.root.request.onRemoveNode(node.id);
      this.root.request.updateNodes();
      this.root.ui.hideMenuPopover();
    }
  }
  onDisconnect() {
    //
  }
  onPureClick(e: fabric.IEvent) {
    if (!isLogicNode(e.target)) return;
    const id = e.target.id;
    if (this.root.canvas.viewOnly) {
      this.root.ui.setNodeId(id);
      this.root.ui.showNodeDrawer();
      return;
    }
    const { left, width, top } = e.target.getBoundingRect();
    this.root.ui.showMenuPopover({
      // left: left + width + 4,
      // top: top,
      left: left + width / 2 - 50,
      top: top - 50,
      id,
    });
  }
  onCanvasSettingsChange() {
    this.root.ui.hideMenuPopover();
    if (this.canvas.viewOnly) return;
    this.root.request.updateCanvasSettings();
  }
  onClickConnectionLine(line: ConnectionLine) {
    if (line.upstream && line.downstream) {
      this.root.params.connectionLine = line;
      this.root.params.show(line.upstream, line.downstream, EditType.edit);
    }
  }
  onNodeAdded(node: Bloc) {
    const info = node.getJson();
    this.root.request.onAddNode(node.id, {
      ...info,
      param_ipts: [],
    });
    this.root.request.updateNodes();
  }
}
