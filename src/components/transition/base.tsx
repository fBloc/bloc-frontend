import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { usePrevious } from "@/hooks/usePrevious";

interface TransitionPropsd extends React.HTMLAttributes<HTMLDivElement> {
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  open?: boolean;
  /**
   * 动画持续时间，单位：ms
   */
  timeout?: number;
  /**
   * 自定义的动画名称
   */
  animationName: string;
  timingFunction?: string;
}
export type TransitionProps = Omit<TransitionPropsd, "animationName">;
const BaseTransition: React.FC<TransitionPropsd> = ({
  open,
  timeout = 300,
  children,
  onExit,
  onExited,
  onEntered,
  onEnter,
  animationName,
  timingFunction, // TODO
  style,
  ...rest
}) => {
  const [visible, setVisible] = useState(false);
  const previousVisible = usePrevious(visible);
  const previousOpen = usePrevious(open);
  const ref = useRef<HTMLDivElement>(null);
  const initialAnimation = useMemo(() => `${animationName} ${timeout}ms backwards`, [animationName, timeout]);
  useEffect(() => {
    if (previousOpen === open) return;
    let alive = true;
    if (open) {
      setVisible(true);
      onEnter?.();
    } else {
      onExit?.();
      if (ref.current) {
        ref.current.style.animation = `${animationName} ${timeout}ms reverse`;
      }
      const fn = () => {
        if (!alive) return;
        setVisible(false);
        onExited?.();
        ref.current?.removeEventListener("animationend", fn);
      };
      ref.current?.addEventListener("animationend", fn);
    }
    return () => {
      alive = false;
    };
  }, [open, onExit, onExited, onEnter, animationName, timeout, previousOpen]);
  useEffect(() => {
    if (visible === previousVisible || !visible) return;
    let alive = true;
    const fn = () => {
      if (!alive) return;
      onEntered?.();
      ref.current?.removeEventListener("animationend", fn);
      if (ref.current) {
        ref.current.style.animation = "";
      }
    };
    if (ref.current) {
      ref.current.style.animation = initialAnimation;
    }
    ref.current?.addEventListener("animationend", fn);
    return () => {
      alive = false;
    };
  }, [visible, onEntered, initialAnimation, previousVisible]);
  if (!visible) return null;
  return (
    <div
      ref={ref}
      style={{
        animation: initialAnimation,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default memo(BaseTransition);
