import React, { useCallback, useEffect } from "react";
import { createCmdComponent, CmdComponentProps } from "@/shared/createCmdComponent";
import Portal from "../portal";
import { Slide, TransitionProps } from "../transition";

export type ToastProps = CmdComponentProps &
  Partial<TransitionProps> & {
    autoHideDuration?: number;
  };
const Toast: React.FC<ToastProps> = ({ onExited, onResolve, autoHideDuration, onEnter, onExit, ...rest }) => {
  const scopeOnEnter = useCallback(() => {
    document.body.style.pointerEvents = "none";
    document.body.style.overflow = "hidden";
    onEnter?.();
  }, [onEnter]);
  const scopeOnExited = useCallback(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    onExited?.();
  }, [onExited]);

  useEffect(() => {
    let alive = true;
    if (autoHideDuration) {
      setTimeout(() => {
        if (alive) {
          onResolve?.();
        }
      }, autoHideDuration);
    }
    return () => {
      alive = false;
    };
  }, [autoHideDuration, onResolve]);

  return (
    <Portal>
      <Slide
        onExit={onExit}
        onEnter={scopeOnEnter}
        onExited={scopeOnExited}
        className="bg-gray-800 fixed bottom-4 left-1/2 text-white p-2 rounded-lg -translate-x-1/2 z-30"
        {...rest}
        animationName="fadeIn"
      />
    </Portal>
  );
};
export default Toast;
export const showToast = createCmdComponent(Toast, false);
