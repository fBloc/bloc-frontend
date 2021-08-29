import { fabric } from "fabric";
import { nodeSettings } from "@/fabric/settings";

const dropAreaSettings = {
  color: {
    allowDrop: "0, 206, 177", // rgb
  },
};
export class DropArea extends fabric.Rect {
  private context!: CanvasRenderingContext2D;
  private text = "";
  constructor(options: ConstructorParameters<typeof fabric.Rect>[0] & { text: string }) {
    super({
      ...options,
      width: nodeSettings.width,
      height: nodeSettings.height,
      fill: "#ccf5ee",
      hasControls: false,
      selectable: false,
      evented: false,
      stroke: `rgba(${dropAreaSettings.color.allowDrop}, 1)`,
      rx: nodeSettings.radius,
      ry: nodeSettings.radius,
    });
    this.text = options.text;
  }
  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.context = ctx;
    this.drawTexts();
  }
  private drawTexts() {
    this.context.fillStyle = `rgba(${dropAreaSettings.color.allowDrop}, 1)`;
    this.context.font = nodeSettings.font;
    const { width } = this.context.measureText(this.text);
    this.context.fillText(this.text, -width / 2, 7);
  }
  reposition({ left, top }: { left: number; top: number }) {
    this.left = left;
    this.top = top;
    this.setCoords();
  }
}
