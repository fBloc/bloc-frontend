import React, { useEffect } from "react";
import classNames from "classnames";
import { FaCircleNotch, IconBaseProps } from "@/components/icons";
import { CmdComponentProps, createCmdComponent } from "@/shared/createCmdComponent";
import styles from "./index.module.scss";

export type LoadingProps = IconBaseProps &
  CmdComponentProps &
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * 自动隐藏的时间，单位ms
     */
    autoHideDuration?: number;
  };
const Loading: React.FC<LoadingProps> = ({
  className,
  onExited,
  onResolve,
  open = true,
  autoHideDuration,
  style,
  children,
  ...rest
}) => {
  useEffect(() => {
    if (!open) {
      onExited?.();
    }
  }, [open, onExited]);
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
  if (!open) return null;
  return (
    <div className={className} style={style}>
      <FaCircleNotch className={classNames(styles.spinner, "inline-block")} {...rest} />
      {children}
    </div>
  );
};
export default Loading;

export const showLoading = createCmdComponent(Loading);
