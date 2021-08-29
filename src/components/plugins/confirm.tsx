import React, { useCallback } from "react";
import { IPluginProps, plugin } from "./helper";
import { Dialog, Button, DialogProps } from "@blueprintjs/core";

type IConfirmProps = {
  body?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
};

type IConfirmPlugin = IPluginProps<boolean | undefined> & Omit<DialogProps, "isOpen"> & IConfirmProps;

export const Confirm: React.FC<IConfirmPlugin> = React.memo(
  ({
    open,
    resolve,
    afterClose,
    body,
    onClosed,
    destroy,
    canOutsideClickClose = false,
    canEscapeKeyClose = false,
    cancelText = "取消",
    confirmText = "确认",
    ...rest
  }) => {
    const cancel = useCallback(() => {
      resolve?.(undefined);
      afterClose?.();
    }, [afterClose, resolve]);

    const confirm = useCallback(() => {
      resolve?.(true);
      afterClose?.();
    }, [afterClose, resolve]);
    const onScopeClosed = useCallback(
      (node: HTMLElement) => {
        onClosed?.(node);
        destroy?.();
      },
      [destroy, onClosed],
    );
    return (
      <Dialog
        isOpen={open}
        onClose={cancel}
        canOutsideClickClose={canOutsideClickClose}
        canEscapeKeyClose={canEscapeKeyClose}
        onClosed={onScopeClosed}
        {...rest}
      >
        {body && <p className="px-5 pt-5">{body}</p>}
        <div className="mt-5 px-5 flex justify-end">
          <Button onClick={cancel} minimal>
            {cancelText}
          </Button>
          <Button intent="primary" className="ml-4" onClick={confirm}>
            {confirmText}
          </Button>
        </div>
      </Dialog>
    );
  },
);

export const ConfirmPlugin = plugin(Confirm);
