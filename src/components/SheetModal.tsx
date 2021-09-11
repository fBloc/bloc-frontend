import React, { useCallback } from "react";
import { Slide, Fade, TransitionProps } from "@/components/transition";
import Portal from "./Portal";

export type ISheetDialogProps = TransitionProps;

const SheetDialog: React.FC<TransitionProps> = React.memo((props) => {
  const { children, onEnter, onExited, ...rest } = props;
  const scopeOnEnter = useCallback(() => {
    onEnter?.();
    document.body.style.overflow = "hidden";
  }, [onEnter]);
  const scopeOnExited = useCallback(() => {
    onExited?.();
    document.body.style.overflow = "";
  }, [onExited]);
  return (
    <Portal>
      <Fade
        className="w-screen h-screen fixed bottom-0 bg-black bg-opacity-60 z-10"
        onEnter={scopeOnEnter}
        onExited={scopeOnExited}
        {...rest}
      />
      <Slide open={rest.open} direction="bottom" className="w-screen fixed bottom-0 z-10">
        {props.children}
      </Slide>
    </Portal>
  );
});

export default SheetDialog;
