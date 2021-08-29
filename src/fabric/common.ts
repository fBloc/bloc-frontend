export enum CanvasEvents {
  DROP = "drop",
  DRAG_OVER = "dragover",
  CANVAS_MOUSE_DOWN = "mouse:down",
  CANVAS_MOUSE_MOVE = "mouse:move",
  MOUSE_WHEEL = "mouse:wheel",
  CANVAS_MOUSE_UP = "mouse:up",
  MOUSE_DBL_CLICK = "mouse:dblclick",
  OBJECT_MOUSE_UP = "mouseup",
  OBJECT_ADDED = "object:added",
  CANVAS_OBJECT_MOVED = "object:moved",
  CANVAS_OBJECT_MOVING = "object:moving",
  OBJECT_REMOVED = "object:removed",
  OBJECT_MOUSE_OVER = "mouseover",
  OBJECT_MOUSE_OUT = "mouseout",
  OBJECT_MOVING = "moving",
  TRANSFORMED = "transformed",
  ZOOMED = "zoomed",
  SELECTION_CREATED = "selection:created",
  SELECTION_UPDATED = "selection:updated",
  SELECTION_CLEARED = "selection:cleared",
  LINE_CLICKED = "line:clicked",
}

export const defaultPosition = {
  left: 0,
  top: 0,
};

export const defaultCoordinate = {
  x: 0,
  y: 0,
};

export interface ICoordinate {
  x: number;
  y: number;
}
