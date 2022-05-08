import React, { forwardRef, useCallback } from "react";
import classNames from "classnames";
import Portal, { PortalProps } from "../portal";
import Fade from "../transition/fade";
import { TransitionProps } from "../transition/base";

export type OverlayProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * 模态框背景色
   */
  backdrop?: string;
  portalDisabled?: boolean;
} & Pick<PortalProps, "mountNode">;

export type OverlayComponentProps<T = {}> = T &
  Omit<TransitionProps, "animationName"> & {
    /**
     * 是否在点击背景时关闭
     */
    closeOnClickBackdrop?: boolean;
  };

const Overlay = forwardRef<HTMLDivElement, OverlayComponentProps<OverlayProps>>(
  (
    {
      open,
      children,
      closeOnClickBackdrop,
      mountNode,
      portalDisabled,
      onEntered,
      onExited,
      className,
      style,
      backdrop,
      ...rest
    },
    ref,
  ) => {
    // TODO ref
    const onScopeEntered = useCallback(() => {
      document.body.style.overflow = "hidden";
      onEntered?.();
    }, [onEntered]);
    const onScopeExited = useCallback(() => {
      document.body.style.overflow = "";
      onExited?.();
    }, [onExited]);

    const close = useCallback(() => {
      if (closeOnClickBackdrop) {
        rest.onExit?.();
      }
    }, [closeOnClickBackdrop, rest]);
    return (
      <Portal disabled={portalDisabled} mountNode={mountNode}>
        <Fade
          onClick={close}
          open={open}
          onEntered={onScopeEntered}
          onExited={onScopeExited}
          className={classNames(className, "fixed left-0 top-0 w-full h-full")}
          style={{
            ...style,
            backgroundColor: backdrop || "rgba(0,0,0,0.5)",
          }}
          {...rest}
        >
          {children}
        </Fade>
      </Portal>
    );
  },
);

export default Overlay;
