import React, { useEffect } from "react";
import classNames from "classnames";
import Overlay, { OverlayComponentProps } from "../overlay";
import { FaTimes } from "@/components/icons";
import Button, { ButtonProps } from "../button";
import { Zoom } from "../transition";

export type DialogProps = OverlayComponentProps<{
  title?: React.ReactNode;
  cancelText?: React.ReactNode;
  confirmText?: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
  size?: "sm" | "md" | "lg";
  width?: number | string;
  /**
   * 是否显示关闭按钮
   */
  closeable?: boolean;
  confirmBtnProps?: Omit<ButtonProps, "onClick">;
  cancelBtnProps?: Omit<ButtonProps, "onClick">;
}>;

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      children,
      className,
      title,
      size = "sm",
      cancelText = "",
      confirmText = "",
      onConfirm,
      onCancel,
      confirmBtnProps,
      cancelBtnProps,
      width,
      ...rest
    },
    ref,
  ) => {
    useEffect(() => {
      //
    }, [onConfirm, onCancel]);
    return (
      <Overlay className={classNames("flex justify-center items-center z-20", className)} {...rest} ref={ref}>
        <Zoom
          open={rest.open}
          className={classNames("bg-white p-5 rounded-lg", {
            "w-[340px]": size === "sm",
            "w-[678px]": size === "md",
            "w-[1024px]": size === "lg",
          })}
          style={{
            width,
          }}
        >
          <div className="flex justify-between items-center">
            <div className="font-medium text-base">{title}</div>
            <Button
              className="w-6 !h-6 !p-0 inline-flex justify-center items-center group"
              variant="text"
              onClick={rest.onExit}
            >
              <FaTimes className="text-gray-400 group-hover:text-gray-600" />
            </Button>
          </div>
          <div className="mt-4">{children}</div>
          {(confirmText || cancelText) && (
            <div className="mt-6 flex justify-end items-center">
              {cancelText && (
                <Button variant="default" onClick={onCancel} {...cancelBtnProps}>
                  {cancelText}
                </Button>
              )}
              {confirmText && (
                <Button
                  onClick={onConfirm}
                  {...confirmBtnProps}
                  className={classNames("ml-2", confirmBtnProps?.className)}
                >
                  {confirmText}
                </Button>
              )}
            </div>
          )}
        </Zoom>
      </Overlay>
    );
  },
);

export default Dialog;
