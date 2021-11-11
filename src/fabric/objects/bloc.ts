import { IRectOptions, LogicNode, NodeType } from "./node";
import { nodeSettings, primaryColor } from "@/fabric/settings";
import playIcon from "@/assets/images/play-icon.png";
import { BlocItem, ParamIpt } from "@/api/flow";

type BlocOptions = {
  blocId: string;
  id: string;
  name: string;
  upstream?: string[];
  downstream?: string[];
  paramIpts?: ParamIpt[][];
} & IRectOptions;

export abstract class BasicBloc extends LogicNode {
  blocId: string;
  abstract renderName(): void;
  context?: CanvasRenderingContext2D;
  paramIpts?: ParamIpt[][] = [];
  constructor({ blocId, id, name, upstream = [], downstream = [], paramIpts = [], ...rest }: BlocOptions) {
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
    this.paramIpts = paramIpts;
  }
  _render(context: CanvasRenderingContext2D) {
    super._render(context);
    this.context = context;
    this.renderName();
  }
  setParamIpts(paramIpts: BlocItem["param_ipts"]) {
    this.paramIpts = paramIpts;
  }
  getJson(): BlocItem {
    const { downstream, upstream, blocId, left = 0, top = 0, id, paramIpts } = this;
    return {
      id,
      function_id: blocId,
      position: {
        left,
        top,
      },
      note: this.name,
      upstream_flowfunction_ids: upstream,
      downstream_flowfunction_ids: downstream,
      param_ipts: paramIpts,
    };
  }
}

export class BlocStartNode extends BasicBloc {
  readonly nodeType = NodeType.system;
  constructor(options?: Omit<BlocOptions, "id" | "blocId" | "name" | "paramIpts">) {
    super({
      ...options,
      fill: `${primaryColor}22`,
      stroke: primaryColor,
      lockMovementX: true,
      lockMovementY: true,
      blocId: "4c0e909e-4176-4ce2-a3f6-f30dab71c936", //  固定写死
      id: "START_NODE",
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
