import React, { useCallback } from "react";
import { CmdComponentProps, createCmdComponent } from "@/shared/createCmdComponent";
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import i18n from "@/i18n";
export type Confirmprops = DialogProps &
  CmdComponentProps<boolean> & {
    body?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
const Confirm: React.FC<Confirmprops> = ({
  onResolve,
  onCancel,
  onConfirm,
  onExited: cmdOnExited,
  title,
  body,
  cancelText = i18n.t("cancel"),
  confirmText = i18n.t("confirm"),
  open,
  ...rest
}) => {
  const { onExit, onExited, ...restTransitionProps } = rest.TransitionProps || {};
  const onScopeCancel = useCallback(() => {
    onCancel?.();
    onResolve?.(false);
  }, [onResolve, onCancel]);
  const onScopeConfrim = useCallback(() => {
    onConfirm?.();
    onResolve?.(true);
  }, [onResolve, onConfirm]);
  const onInternalExited = useCallback(
    (e: HTMLElement) => {
      cmdOnExited?.(e);
      onExited?.(e);
    },
    [cmdOnExited, onExited],
  );
  return (
    <Dialog
      open={open}
      TransitionProps={{
        onExited: onInternalExited,
        onExit,
        ...restTransitionProps,
      }}
      {...rest}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onScopeCancel}>{cancelText}</Button>
        <Button onClick={onScopeConfrim}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export const showConfirm = createCmdComponent(Confirm);
export default Confirm;
export { default as RequestConfirm } from "./RequestConfirm";
export * from "./RequestConfirm";
