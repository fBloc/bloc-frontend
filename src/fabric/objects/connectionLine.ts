import { fabric } from "fabric";
import { ICoordinate, defaultCoordinate } from "@/fabric/common";
import { nodeSettings, triggerSettings, connectionLineSettings } from "@/fabric/settings";
import { findLogicNodeById, getNodeAbsoluteCoordinate } from "@/fabric/tools";
import { OrthogonalConnector } from "@/fabric/tools/path";
import { LogicNode } from "./node";
import { Canvas } from "./canvas";

function generateFullRoutePoints([x1, y1, x2, y2]: [x1: number, y1: number, x2: number, y2: number]) {
  const gap = 6;
  const { width, height } = nodeSettings;
  return OrthogonalConnector.route({
    pointA: {
      shape: {
        left: x1,
        top: y1 + gap,
        width,
        height,
      },
      side: "bottom",
      distance: 0.5,
    },
    pointB: {
      shape: {
        left: x2,
        top: y2 - gap,
        width,
        height,
      },
      side: "top",
      distance: 0.5,
    },
    shapeMargin: 10,
    globalBoundsMargin: 100,
    globalBounds: { left: -9999, top: -9999, width: 999999, height: 999999 }, // TODO
  }).map(({ x, y }) => new fabric.Point(x, y));
}

function initializePoints([x1, y1, x2, y2]: [number, number, number, number]) {
  return x1 === x2 && y1 === y2
    ? [
        {
          x: x1 + nodeSettings.width / 2,
          y: y1 + nodeSettings.height,
        },
        {
          x: x1 + nodeSettings.width / 2,
          y: y1 + nodeSettings.height,
        },
      ]
    : generateFullRoutePoints([x1, y1, x2, y2]);
}

export class ConnectionLine extends fabric.Polyline {
  private context!: CanvasRenderingContext2D;
  private hotZoneColor = "transparent";
  isValid = false;
  upstream?: string;
  downstream?: string;
  upstreamNode?: LogicNode;
  downstreamNode?: LogicNode;
  private x1 = 0;
  private y1 = 0;
  private x2 = 0;
  private y2 = 0;
  private focused = false;
  hotZone!: Path2D;
  private settings = {
    color: "#a39eb4",
    activeColor: "#0193ff", // TODO 颜色常量
    lineStrokeWith: 2,
    arrowSize: {
      width: 14,
      height: 12,
    },
  };
  constructor(
    [x1, y1, x2, y2]: [x1: number, y1: number, x2: number, y2: number],
    options: { upstream: string; downstream?: string },
  ) {
    super(initializePoints([x1, y1, x2, y2]), {
      objectCaching: false,
      fill: "transparent",
      strokeWidth: 2,
      stroke: "#a39eb4",
      evented: false,
      selectable: false,
      hasControls: false,
      hasBorders: false,
    });
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    const { upstream, downstream } = options;
    this.upstream = upstream;
    this.downstream = downstream;
  }
  private get canvasContext() {
    return this.canvas?.getContext();
  }
  private get startPoint() {
    if (!this.points || this.points.length < 2) return defaultCoordinate;
    return this.points?.[0] || defaultCoordinate;
  }
  private get destPoint() {
    if (!this.points || this.points.length < 2) return defaultCoordinate;
    const point = this.points?.[this.points.length - 1];
    return point || defaultCoordinate;
  }
  private findNode(id: string) {
    return this.canvas && findLogicNodeById(this.canvas as Canvas, id);
  }
  registerNodes() {
    if (this.upstream && !this.upstreamNode) {
      this.upstreamNode = this.findNode(this.upstream);
    }
    if (this.downstream && !this.downstreamNode) {
      this.downstreamNode = this.findNode(this.downstream);
    }
  }
  isOnScreen() {
    return true;
  }
  private drawMakers() {
    this.drawMarker(this.startPoint);
  }
  private drawMarker(point: ICoordinate) {
    const [zoomX] = this.canvas?.viewportTransform || [1];
    const { x, y } = this.getTransformedPoint(point);
    const ctx = this.canvasContext;
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.fillStyle = "#fff";
    ctx.arc(x, y, 4 * zoomX, 0, Math.PI * 2);
    ctx.closePath();
    ctx.lineWidth = 4 * zoomX;
    ctx.stroke();
    ctx.fill();
  }
  /**
   * 计算移动、缩放画板后的point的位置
   * zoomX与zoomY 相等，此处只使用zoomX
   */
  private getTransformedPoint({ x, y }: ICoordinate) {
    const [zoomX, , , , shiftX, shiftY] = this.canvas?.viewportTransform || [1, 0, 0, 0, 0, 0];
    return {
      x: x * zoomX + shiftX,
      y: y * zoomX + shiftY,
    };
  }
  _render(ctx: CanvasRenderingContext2D) {
    if (this.x1 === this.x2 && this.y1 === this.y2) return;
    super._render(ctx);
    this.context = ctx;
    (this.canvas as Canvas)?.setRatioTransform();
    if (this.focused) {
      this.drawMakers();
    }
    this.drawArrow();
    this.drawHotZone();
  }

  updateEndPoint(x: number, y: number) {
    this.x2 = x;
    this.y2 = y;
    this.points = generateFullRoutePoints([this.x1, this.y1, x, y]);
  }

  updateStartPoint() {
    if (!this.upstreamNode) return;
    this.setCoords();
    const { x, y } = getNodeAbsoluteCoordinate(this.upstreamNode);
    this.x1 = x;
    this.y1 = y;
    const points = generateFullRoutePoints([x, y, this.x2, this.y2]);
    this.points = points;
  }
  updateDestPointByMoveNode() {
    if (!this.downstreamNode) return;
    const { x, y } = getNodeAbsoluteCoordinate(this.downstreamNode);
    this.updateEndPoint(x, y);
  }
  normalizePoints() {
    this.registerNodes();
    if (!this.upstreamNode || !this.downstreamNode) return;
    const { left: uLeft = 0, top: uTop = 0 } = this.upstreamNode;
    const { left: dLeft = 0, top: dTop = 0 } = this.downstreamNode;
    this.setOptions({
      points: generateFullRoutePoints([uLeft, uTop, dLeft, dTop]).map((item, index) =>
        index === 0
          ? {
              ...item,
              y: item.y,
            }
          : item,
      ),
    });
  }
  private drawArrow() {
    if (!this.canvasContext) return;
    const { x, y } = this.getTransformedPoint(this.destPoint);
    const [zoomX] = this.canvas?.viewportTransform || [1];

    const {
      activeColor,
      color,
      arrowSize: { width: $arrowWidth, height: $arrowHeight },
    } = this.settings;
    const arrowWidth = $arrowWidth * zoomX;
    const arrowHeight = $arrowHeight * zoomX;
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(x, y - 9 * zoomX); // j
    this.canvasContext.lineTo(x + arrowWidth / 2, y - arrowHeight - 2 * zoomX);
    this.canvasContext.lineTo(x, y + 2 * zoomX);
    this.canvasContext.lineTo(x - arrowWidth / 2, y - arrowHeight - 2 * zoomX);
    this.canvasContext.closePath();
    this.canvasContext.fillStyle = this.focused ? activeColor : color;
    this.canvasContext.fill();
  }

  drawHotZone() {
    if (!this.canvasContext) return;
    const {
      hotZone: { lineWidth },
    } = connectionLineSettings;
    const path = new Path2D();
    const [zoomX] = this.canvas?.viewportTransform || [1, 0, 0, 0, 0, 0];
    const [startPoint, ...rest] = (this.points || []).map((point) => {
      const { x, y } = this.getTransformedPoint(point);
      return new fabric.Point(x, y);
    });

    this.canvasContext.lineWidth = lineWidth * zoomX;
    if (!startPoint) return;
    path.moveTo(startPoint.x, startPoint.y);
    rest.forEach(({ x, y }) => {
      path.lineTo(x, y);
    });
    this.canvasContext.strokeStyle = this.hotZoneColor;
    this.canvasContext.stroke(path);
    this.hotZone = path;
  }
  private drawStarter(point: ICoordinate) {
    const { background } = triggerSettings;
    this.context.beginPath();
    this.context.arc(point.x, point.y + triggerSettings.radius, triggerSettings.radius, 0, Math.PI * 2);
    this.context.fillStyle = background;
    this.context.closePath();
    this.context.fill();
    this.context.shadowBlur = 0;
  }
  setDownstream(id: string) {
    this.downstream = id;
  }
  work() {
    this.registerNodes();
    this.downstreamNode?.registerUpstream(this);
    this.upstreamNode?.registerDownstream(this);
  }
  destroy() {
    this.upstreamNode?.unregisterDownstream(this);
    this.downstreamNode?.unregisterUpstream(this);
    this?.canvas?.remove(this);
  }
  focus() {
    if ((this.canvas as Canvas).readonly) return;
    this.focused = true;
    this.hotZoneColor = `${this.settings.activeColor}18`;
    this.setOptions({
      stroke: this.settings.activeColor,
    });
    this.bringToFront();
  }
  blur() {
    this.focused = false;
    this.setOptions({
      stroke: this.settings.color,
    });
  }
  setOnHover() {
    if ((this.canvas as Canvas).spacebarPressed) return;
    this.hotZoneColor = `${this.settings.activeColor}18`;
    this.dirty = true;
  }
  setNormal() {
    this.hotZoneColor = "transparent";
    this.dirty = true;
  }
}

export function isConnectionLine(object: unknown): object is ConnectionLine {
  return object instanceof ConnectionLine;
}
