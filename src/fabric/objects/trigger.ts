import { fabric } from "fabric";
import { getNodeAbsoluteCoordinate } from "@/fabric/tools";
import { primaryColor, triggerSettings } from "@/fabric/settings";
import { ConnectionLine } from "./connectionLine";
import { LogicNode } from "./node";
import { Canvas } from "./canvas";

export class Trigger extends fabric.Circle {
  hoverCursor = "pointer";
  constructor(public host: LogicNode, option: ConstructorParameters<typeof fabric.Circle>[0] = {}) {
    super({
      ...option,
      radius: triggerSettings.radius,
      fill: primaryColor,
      selectable: false,
      hasControls: false,
      hasBorders: false,
      strokeWidth: 4,
      // stroke: `${primaryColor}44`,
      stroke: `rgba(0,0,0,0.2)`,
    });
    host.registerTrigger(this);
  }
  private line?: ConnectionLine;
  get enhancedCanvas() {
    return this.canvas as Canvas;
  }
  setPosition() {
    const { width = 0, height = 0 } = this.host;
    const { x, y } = getNodeAbsoluteCoordinate(this.host);
    const radius = this.radius || 0;
    this.setOptions({
      left: x + width / 2 - radius - 1.5,
      top: y + height + 4,
    });
    this.setCoords();
  }
  destroy() {
    this.canvas?.remove(this);
  }
}

export function isTriggerNode(o: unknown): o is Trigger {
  return o instanceof Trigger;
}
