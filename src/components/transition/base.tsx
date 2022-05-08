import React, { useState, useEffect, useRef, useMemo } from "react";
export interface TransitionProps extends React.HTMLAttributes<HTMLDivElement> {
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
  animationName?: string;
  timingFunction?: string;
}
const BaseTransition: React.FC<TransitionProps> = ({
  open,
  timeout = 300,
  children,
  onExited,
  onEntered,
  onEnter,
  animationName,
  style,
  onExit,
  ...rest
}) => {
  const [visible, setVisible] = useState(false);
  const previousVisible = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const initialAnimation = useMemo(() => `${animationName} ${timeout}ms backwards`, [animationName, timeout]);

  useEffect(() => {
    if (previousVisible.current === open) return;
    let alive = true;
    if (open) {
      setVisible(true);
      onEnter?.();
      const fn = () => {
        if (!alive) return;
        onEntered?.();
        ref.current?.removeEventListener("animationend", fn);
        if (ref.current) {
          ref.current.style.animation = "";
        }
      };
      ref.current?.addEventListener("animationend", fn);
      if (ref.current) {
        ref.current.style.animation = initialAnimation;
      }
    } else {
      const fn = () => {
        if (!alive) return;
        onExited?.();
        setVisible(false);
        ref.current?.removeEventListener("animationend", fn);
      };
      ref.current?.addEventListener("animationend", fn);
      if (ref.current) {
        ref.current.style.animation = `${animationName} ${timeout}ms reverse`;
      }
    }
    return () => {
      alive = false;
    };
  }, [open, onExited, onEnter, animationName, timeout, visible, onEntered, initialAnimation]);
  useEffect(() => {
    previousVisible.current = visible;
  }, [visible]);
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

export default BaseTransition;
