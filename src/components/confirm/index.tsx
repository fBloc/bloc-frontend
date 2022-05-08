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
  title,
  body,
  cancelText = "取消",
  confirmText = "确认",
  open,
  ...rest
}) => {
  const onExit = rest.TransitionProps?.onExit;
  const onScopeCancel = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      onExit?.(e.currentTarget);
      onCancel?.();
      onResolve?.(false);
    },
    [onExit, onResolve, onCancel],
  );
  const onScopeConfrim = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      onExit?.(e.currentTarget);
      onConfirm?.();
      onResolve?.(true);
    },
    [onExit, onResolve, onConfirm],
  );

  return (
    <Dialog open={open} {...rest}>
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
