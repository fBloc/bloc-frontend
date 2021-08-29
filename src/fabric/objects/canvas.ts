import { fabric } from "fabric";
import { DangerousAny } from "@/common";
import { isLogicNode, LogicNode } from "./node";
import { Trigger } from "./trigger";
import { CanvasEvents, ICoordinate } from "../common";

interface CanvasPlugin {
  install(canvas: Canvas, options?: DangerousAny): void;
}

export type IfabricCanvasOptions = ConstructorParameters<typeof fabric.Canvas>;
export type ICanvasOptions = IfabricCanvasOptions[1] & { readonly?: boolean };
export class Canvas extends fabric.Canvas {
  private _readonly = false;
  readonly devicePixelRatio = window.devicePixelRatio;
  disableHotkeys = false;
  spacebarPressed = false;
  trigger?: Trigger;
  hoveringTarget?: LogicNode;
  constructor(element: IfabricCanvasOptions[0], { readonly, ...options }: ICanvasOptions) {
    super(element, options);
    this.setReadonly(readonly || false);
  }
  get viewportTranslate() {
    const transform = this.viewportTransform || [0, 0, 0, 0, 0, 0];
    return {
      x: transform[4],
      y: transform[5],
    };
  }
  get readonly() {
    return this._readonly;
  }
  setRatioTransform() {
    const context = this.getContext();
    context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
  }
  setReadonly(readonly: boolean) {
    this._readonly = readonly;
    this.selection = !readonly;
    this.discardActiveObject();
    this._objects.forEach((object) => {
      if (isLogicNode(object)) {
        object.selectable = !readonly;
        object.dirty = true;
      }
    });
    this.renderAll();
  }
  use(plugin: CanvasPlugin, options?: DangerousAny) {
    plugin.install(this, options);
    return this;
  }
  setTranslate({ x, y }: ICoordinate) {
    const transform = this.viewportTransform;
    if (!transform) return;
    transform[4] = x;
    transform[5] = y;
    this.setViewportTransform(transform);
  }
  resetTranslate() {
    this.setTranslate({ x: 0, y: 0 });
  }
  reset() {
    this.clear();
    this.setZoom(1);
    this.setTranslate({
      x: 0,
      y: 0,
    });
    this.fire(CanvasEvents.ZOOMED, 1);
    this.fire(CanvasEvents.TRANSFORMED);
  }
}
