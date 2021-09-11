import { Nullable } from "@/common";
import { Canvas } from "@/fabric/objects";
import { resize } from "../tools";

const onResize = {
  install(canvas: Canvas) {
    let timer: Nullable<number> = null;
    const onResize = () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      const op = () => resize(canvas);
      timer = window.setTimeout(op, 1000);
    };
    window.addEventListener("resize", onResize); // TODO destroy
  },
};

export default onResize;
