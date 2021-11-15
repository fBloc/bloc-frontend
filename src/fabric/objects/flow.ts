import { nodeSettings, primaryColor } from "@/fabric/settings";
import { DEFAULT_START_NODE_ID, getNodeAbsoluteCoordinate } from "@/fabric/tools";
import { IRectOptions, LogicNode, NodeType } from "./node";
import playIcon from "@/assets/images/play-icon.png";

type IFlowOptions = IRectOptions & {
  flowId: string;
  id: string;
  name: string;
  fill: string;
  stroke: string;
  upstream?: string[];
  downsream?: string[];
};
export abstract class BasicFlow extends LogicNode {
  protected flowId: string;
  abstract renderName(): void;
  context?: CanvasRenderingContext2D;
  constructor({ flowId, name, id, upstream, downsream, ...rest }: IFlowOptions) {
    super({
      ...rest,
      width: nodeSettings.width,
      height: nodeSettings.height,
      rx: 4,
      ry: 4,
      borderColor: primaryColor,
    });
    this.id = id;
    this.flowId = flowId;
    this.name = name;
    this.upstream = upstream || [];
    this.downstream = downsream || [];
  }
  _render(context: CanvasRenderingContext2D) {
    super._render(context);
    this.context = context;
    this.renderName();
  }
  getJson() {
    const { downstream, upstream, flowId, id } = this;
    const { x, y } = getNodeAbsoluteCoordinate(this);
    return {
      id,
      flow_origin_id: flowId,
      upstream_flow_ids: upstream,
      downstream_flow_ids: downstream,
      position: {
        left: x,
        top: y,
      },
    };
  }
}

export class FlowStartNode extends BasicFlow {
  readonly nodeType = NodeType.system;
  constructor(options: Omit<IFlowOptions, "fill" | "stroke" | "flowId" | "id" | "name">) {
    super({
      ...options,
      fill: `${primaryColor}22`,
      stroke: primaryColor,
      flowId: DEFAULT_START_NODE_ID.NUMBER, // TODO FLOW ID
      id: "START_NODE",
      name: "开始节点",
      lockMovementX: true,
      lockMovementY: true,
    });
  }
  renderName() {
    if (!this.context) return;
    this.context.font = nodeSettings.font;
    const { width } = this.context.measureText(this.name);
    this.context.fillStyle = primaryColor;
    this.context.fillText(this.name, -width / 2 + 20, 6);
    const img = new Image();
    img.onload = () => {
      this.context?.drawImage(img, -width / 2, -6, 14, 14);
      this.canvas?.renderAll();
    };
    img.src = playIcon;
  }
}

export class Flow extends BasicFlow {
  nodeType = NodeType.feature;
  constructor(options: Omit<IFlowOptions, "fill" | "stroke">) {
    super({
      ...options,
      fill: "#fff",
      stroke: "#e8e8e8",
    });
  }
  renderName() {
    if (!this.context) return;
    this.context.font = nodeSettings.font;
    const { width } = this.context.measureText(this.name);
    this.context.fillStyle = nodeSettings.nameColor;
    this.context.fillText(this.name, -width / 2, 7);
  }
}

export function isFlowNode(object: unknown): object is BasicFlow {
  return object instanceof BasicFlow;
}
