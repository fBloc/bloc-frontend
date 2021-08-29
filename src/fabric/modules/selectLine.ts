import { CanvasEvents } from "../common";
import { defaultCoordinate, ICoordinate } from "../../../common";
import { Canvas, isType, ConnectionLine } from "../objects";
import { connectionLineSettings } from "../objects/settings";

function getLineObjects(canvas: Canvas) {
  return canvas._objects.filter((object) => isType(object, ConnectionLine)) as ConnectionLine[];
}

function findActiveLine(canvas: Canvas, coordinate: ICoordinate) {
  const ratio = canvas.devicePixelRatio;
  const canvasContext = canvas.getContext();

  const lines = getLineObjects(canvas);
  const { x, y } = coordinate || defaultCoordinate;
  const previousTransform = canvasContext.getTransform();
  const {
    hotZone: { lineWidth },
  } = connectionLineSettings;

  canvasContext.lineWidth = lineWidth * canvas.getZoom();
  lines.forEach((line) => {
    line.blur();
    line.setNormal();
  });
  canvasContext.setTransform(previousTransform);

  return lines.find((line) => line.hotZone && canvasContext.isPointInStroke(line.hotZone, x * ratio, y * ratio));
}
const selectLine = {
  install(canvas: Canvas) {
    const onMouseUp = (e: fabric.IEvent) => {
      const ratio = canvas.devicePixelRatio;
      const canvasContext = canvas.getContext();

      const lines = getLineObjects(canvas);
      const { x, y } = e.pointer || defaultCoordinate;
      const previousTransform = canvasContext.getTransform();
      const {
        hotZone: { lineWidth },
      } = connectionLineSettings;

      canvasContext.lineWidth = lineWidth * canvas.getZoom();
      lines.forEach((line) => {
        line.blur();
      });

      const focusedLine = lines.find((line) => line.hotZone && canvasContext.isPointInStroke(line.hotZone, x * ratio, y * ratio));
      if (focusedLine && !canvas.hoveringTarget) {
        canvas.fire(CanvasEvents.LINE_CLICKED, {
          ...e,
          target: focusedLine,
        });
      }
      canvasContext.setTransform(previousTransform);
      canvas.renderAll();
    };
    const onMouseMove = (e: fabric.IEvent) => {
      const focusedLine = findActiveLine(canvas, e.pointer || defaultCoordinate);
      if (focusedLine && !canvas.hoveringTarget) {
        focusedLine.setOnHover();
      }
      canvas.renderAll();
    };
    canvas.on(CanvasEvents.CANVAS_MOUSE_UP, onMouseUp);
    canvas.on(CanvasEvents.CANVAS_MOUSE_MOVE, onMouseMove);
    return () => {
      canvas.off(CanvasEvents.CANVAS_MOUSE_UP, onMouseUp);
      canvas.off(CanvasEvents.CANVAS_MOUSE_MOVE, onMouseMove);
    };
  },
};

export default selectLine;
