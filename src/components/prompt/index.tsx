import { CmdComponentProps, createCmdComponent } from "@/shared/createCmdComponent";
import { handleStringChange } from "@/shared/form";
import React, { useCallback, useState } from "react";
import Dialog, { DialogProps } from "../dialog";
import Input from "../input";

export type PromptProps = DialogProps &
  CmdComponentProps<string> & {
    inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onValueChange">;
  };
const Prompt = React.forwardRef<HTMLDivElement, PromptProps>(
  ({ onResolve, onExited, onExit, inputProps, ...rest }, ref) => {
    const [value, setValue] = useState("");
    const internalOnConfirm = useCallback(() => {
      onResolve?.(value);
      onExit?.();
    }, [value, onResolve, onExit]);
    const internalOnCancel = useCallback(() => {
      onResolve?.("");
      onExit?.();
    }, [onResolve, onExit]);
    const internalOnExited = useCallback(() => {
      setValue("");
      onExited?.();
    }, [onExited]);
    return (
      <Dialog
        ref={ref}
        confirmText="确认"
        cancelText="取消"
        onExited={internalOnExited}
        onConfirm={internalOnConfirm}
        onCancel={internalOnCancel}
        onExit={internalOnCancel}
        {...rest}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            internalOnConfirm();
          }}
        >
          <Input autoFocus value={value} block onChange={handleStringChange(setValue)} {...inputProps} />
        </form>
      </Dialog>
    );
  },
);

export default Prompt;

export const showPrompt = createCmdComponent(Prompt);
