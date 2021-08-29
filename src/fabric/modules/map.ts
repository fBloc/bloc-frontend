import { Canvas } from "@/fabric/objects";
import { makeCanvasZoomable } from "@/fabric/tools";

const mapModule = {
  install(canvas: Canvas) {
    makeCanvasZoomable(canvas);
  },
};

export default mapModule;
