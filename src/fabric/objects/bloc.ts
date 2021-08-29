import { IRectOptions, LogicNode, NodeType } from "./node";
import { nodeSettings, primaryColor } from "@/fabric/settings";
import playIcon from "@/assets/images/play-icon.png";

type BlocOptions = {
  blocId: string;
  id: string;
  name: string;
  upstream?: string[];
  downstream?: string[];
} & IRectOptions;

export abstract class BasicBloc extends LogicNode {
  blocId: string;
  abstract renderName(): void;
  context?: CanvasRenderingContext2D;
  constructor({ blocId, id, name, upstream = [], downstream = [], ...rest }: BlocOptions) {
    super({
      ...rest,
      rx: nodeSettings.radius,
      ry: nodeSettings.radius,
    });
    this.id = id;
    this.blocId = blocId;
    this.name = name;
    this.upstream = upstream;
    this.downstream = downstream;
  }
  _render(context: CanvasRenderingContext2D) {
    super._render(context);
    this.context = context;
    this.renderName();
  }
  getJson() {
    const { downstream, upstream, blocId, left = 0, top = 0, id } = this;
    return {
      id,
      bloc_id: blocId,
      position: {
        left,
        top,
      },
      note: this.name,
      upstream_bloc_ids: upstream,
      downstream_bloc_ids: downstream,
    };
  }
}

export class BlocStartNode extends BasicBloc {
  readonly nodeType = NodeType.system;
  constructor(options?: Omit<BlocOptions, "id" | "blocId" | "name">) {
    super({
      ...options,
      fill: `${primaryColor}22`,
      stroke: primaryColor,
      lockMovementX: true,
      lockMovementY: true,
      blocId: "0",
      id: "0",
      name: "开始节点",
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

export class Bloc extends BasicBloc {
  readonly nodeType = NodeType.feature;
  constructor(options: BlocOptions) {
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

export function isBlocNode(node: unknown): node is BasicBloc {
  return node instanceof BasicBloc;
}
