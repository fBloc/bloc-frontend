import { fabric } from "fabric";
import { DangerousAny } from "@/common";
import { ToastPlugin } from "@/components/plugins";
import { findLogicNodeById } from "@/fabric/tools";
import { nodeSettings, primaryColor } from "@/fabric/settings";
import { CanvasEvents } from "@/fabric/common";
import { Trigger } from "./trigger";
import { Canvas } from "./canvas";
import { ConnectionLine } from "./connectionLine";
// import { ChainZone } from "./chainZone";

export function isLogicNode(instance: unknown): instance is LogicNode {
  return instance instanceof LogicNode;
}

export type IRectOptions = ConstructorParameters<typeof fabric.Rect>[0];

export enum NodeType {
  /** 系统节点 */
  system,
  /** 普通flow */
  feature,
}
export abstract class LogicNode extends fabric.Rect {
  id = "";
  trigger?: Trigger;
  canvas?: Canvas;
  upstream: string[] = [];
  downstream: string[] = [];
  name = "";
  hoverCursor = "cursor";
  moveCursor = "cursor";
  abstract nodeType: NodeType;
  private inlines: ConnectionLine[] = [];
  private outlines: ConnectionLine[] = [];
  private selected = false;
  constructor(options: IRectOptions) {
    super({
      ...options,
      width: nodeSettings.width,
      height: nodeSettings.height,
      hasBorders: false,
      hasControls: false,
      selectable: true,
    });
    this.on(CanvasEvents.OBJECT_MOUSE_OVER, this.onMouseOver);
    this.on(CanvasEvents.OBJECT_MOUSE_OUT, this.onMouseOut);
    this.on(CanvasEvents.OBJECT_MOVING, this.onMoving);
  }
  onMoving = () => {
    this.trigger?.setPosition();
    this.updateInlines();
    this.updateOutlines();
    this.canvas?.renderAll();
  };
  private updateState() {
    if (this.nodeType === NodeType.feature) {
      this.stroke = this.selected ? primaryColor : "#e8e8e8";
      this.dirty = true;
      this.canvas?.renderAll();
    }
  }
  onSelect() {
    if (this.canvas?.spacebarPressed) return true;
    this.selected = true;
    this.updateState();
    this.setTrigger();
    return false;
  }
  onDeselect() {
    const canvas = this.canvas as Canvas;
    this.selected = false;
    if (canvas.trigger?.host === this) {
      if (this.nodeType === NodeType.feature) {
        this.updateState();
      }
      this.destroyTrigger();
    }
    return false;
  }
  registerTrigger(trigger: Trigger) {
    this.trigger = trigger;
  }
  private setTrigger() {
    const canvas = this.canvas as Canvas;
    if (!canvas || canvas.readonly) return;
    canvas.trigger?.destroy();
    const trigger = new Trigger(this);
    canvas.add(trigger);
    trigger.setPosition();
    canvas.trigger = trigger;
  }
  destroyTrigger() {
    const canvas = this.canvas as Canvas;
    canvas.trigger?.destroy();
    canvas && (canvas.trigger = undefined);
  }
  markHighlight() {
    const nodes: LogicNode[] = [];
    const canvas = this.canvas as Canvas;
    function collectNodes(nodeId: string, dir: "up" | "down") {
      const node = findLogicNodeById(canvas, nodeId);
      if (node && !nodes.includes(node)) {
        nodes.push(node);
      }
      const targets = (dir === "up" ? node?.upstream : node?.downstream) || [];
      targets.forEach((node) => {
        collectNodes(node, dir);
      });
    }
    collectNodes(this.id, "up");
    collectNodes(this.id, "down");
  }
  private onMouseOver = () => {
    if (this.canvas?.spacebarPressed) return;
    this.markHighlight();
    (this.canvas as Canvas).hoveringTarget = this;
    if (this.stroke !== primaryColor) {
      this.setOptions({
        stroke: primaryColor,
      });
    }
    this.canvas?.renderAll();
  };
  private onMouseOut = () => {
    (this.canvas as Canvas).hoveringTarget = undefined;
    if (this.stroke !== "#e8e8e8" && this.nodeType === NodeType.feature && !this.selected) {
      this.setOptions({
        stroke: "#e8e8e8",
      });
    }
    this.canvas?.renderAll();
  };
  private showConenctedAlert() {
    ToastPlugin({
      message: "已存在此关联，将忽略此次操作。",
    });
  }
  private clearInlines() {
    this.inlines.forEach((line) => {
      line.destroy();
    });
  }
  private clearOutlines() {
    this.outlines.forEach((line) => {
      line.destroy();
    });
  }
  private disConnectWithUpstream() {
    this.upstream.forEach((id) => {
      const node = this.canvas?._objects.find((object) => isLogicNode(object) && object.id === id) as LogicNode;
      node && node.removeDownstream(id);
    });
  }
  private disconnenctWithDownstream() {
    this.downstream.forEach((id) => {
      const node = this.canvas?._objects.find((object) => isLogicNode(object) && object.id === id) as LogicNode;
      node && node.removeUpstream(id);
    });
  }

  registerUpstream(line: ConnectionLine) {
    this.inlines.push(line);
    if (line.upstream) {
      this.addUpstream(line.upstream);
    }
  }
  registerDownstream(line: ConnectionLine) {
    this.outlines.push(line);
    if (line.downstream) {
      this.addDownstream(line.downstream);
    }
  }
  private addUpstream(...ids: string[]) {
    this.upstream = Array.from(new Set([...this.upstream, ...ids]));
  }
  private addDownstream(...ids: string[]) {
    this.downstream = Array.from(new Set([...this.downstream, ...ids]));
  }
  unregisterUpstream(line: ConnectionLine) {
    line.upstream && this.removeUpstream(line.upstream);
    this.inlines = this.inlines.filter((l) => l !== line);
  }
  unregisterDownstream(line: ConnectionLine) {
    line.downstream && this.removeDownstream(line.downstream);
    this.outlines = this.outlines.filter((l) => l !== line);
  }
  private removeUpstream(id: string) {
    this.upstream = this.upstream.filter((_id) => _id !== id);
  }
  private removeDownstream(id: string) {
    this.downstream = this.downstream.filter((_id) => _id !== id);
  }
  updateOutlines() {
    this.outlines.forEach((item) => {
      item.updateStartPoint();
    });
  }
  updateInlines() {
    this.inlines.forEach((item) => {
      item.updateDestPointByMoveNode();
    });
  }
  drawInlines() {
    const canvas = this.canvas as Canvas;
    if (!canvas) return;
    this.upstream.forEach((item) => {
      addLine(canvas, item, this.id);
    });
  }
  destroy() {
    this.disConnectWithUpstream();
    this.disconnenctWithDownstream();
    this.clearInlines();
    this.clearOutlines();
    this.trigger?.destroy();
    this.canvas?.remove(this);
  }
  abstract getJson(): Record<string, DangerousAny> & { id: string };
}

function addLine(canvas: Canvas, upstream: string, downstream: string) {
  const upstreamNode = findLogicNodeById(canvas, upstream);
  const downstreamNode = findLogicNodeById(canvas, downstream);
  if (!upstreamNode || !downstreamNode || upstreamNode === downstreamNode) return;
  const { left = 0, top = 0 } = upstreamNode;
  const { left: downstreamLeft = 0, top: downstreamTop = 0 } = downstreamNode;
  const line = new ConnectionLine([left, top, downstreamLeft, downstreamTop], {
    upstream,
    downstream,
  });
  upstreamNode.registerDownstream(line);
  downstreamNode.registerUpstream(line);
  canvas?.add(line);
  line.registerNodes();
  return line;
}
