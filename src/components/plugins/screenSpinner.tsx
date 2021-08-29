import React, { memo, useEffect } from "react";
import ReactDOM from "react-dom";
import { Spinner, SpinnerProps } from "@blueprintjs/core";

interface SpinnerPluginProps extends SpinnerProps {
  open: boolean;
  onExit?: () => void;
  message?: React.ReactNode;
}
const ScreenSpinner: React.FC<SpinnerPluginProps> = memo(({ open, onExit, message, ...props }) => {
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
      onExit?.();
    } else {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    }
  }, [open, onExit]);
  if (!open) return null;
  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white min-w-[120px] min-h-[120px] shadow-sm rounded-md flex justify-center items-center">
      <div>
        <Spinner {...props} />
        {message && <div className="mt-4 text-gray-400 justify-center items-center flex">{message}</div>}
      </div>
    </div>
  );
});

export const spinnerPlugin = (() => {
  let div: HTMLDivElement | undefined = undefined;

  return {
    show: (props?: Omit<SpinnerPluginProps, "open" | "onExit">) => {
      if (!div) {
        div = document.createElement("div");
        document.body.appendChild(div);
      }
      ReactDOM.render(<ScreenSpinner open={true} {...props} />, div);
    },
    hide: () => {
      if (!div) return;
      const onExit = () => {
        if (div) {
          ReactDOM.unmountComponentAtNode(div);
          div && div.parentElement?.removeChild(div);
          div = undefined;
        }
      };
      ReactDOM.render(<ScreenSpinner open={false} onExit={onExit} />, div);
    },
  };
})();
