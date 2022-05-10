import React from "react";
import ReactDOM from "react-dom";
import { DialogProps } from "@mui/material";

export interface CmdComponentProps<T = any> {
  open?: boolean;
  onExited?: Required<DialogProps>["TransitionProps"]["onExit"];
  onResolve?: (value?: T) => void;
}
export function createCmdComponent<T extends CmdComponentProps>(Component: React.FC<T>, append = true) {
  type ResultType = T extends { onResolve?: (value: infer P) => void } ? P : never;
  return (props?: Omit<T, "open">) => {
    let close: CmdComponentProps["onResolve"];
    const p = new Promise<ResultType>((resolve) => {
      const div = document.createElement("div");
      append && document.body.appendChild(div);
      const onExited = () => {
        const unmounted = ReactDOM.unmountComponentAtNode(div);
        if (unmounted && div.parentElement) {
          div.parentElement.removeChild(div);
        }
      };
      const onResolve = (v: ResultType) => {
        resolve(v);
        render({
          open: false,
        });
      };
      const render = ({ open }: { open: boolean }) => {
        ReactDOM.render(
          React.cloneElement(<Component {...(props as any)} />, {
            onExited: () => {
              props?.onExited?.(div);
              onExited?.();
            },
            onResolve: (v: ResultType) => {
              props?.onResolve?.(v);
              onResolve(v);
            },
            open,
          }),
          div,
        );
      };
      close = onResolve;
      const onPopState = () => {
        render({
          open: false,
        });
        window.removeEventListener("popstate", onPopState);
      };
      window.addEventListener("popstate", onPopState);
      render({
        open: true,
      });
    });
    (p as any).close = close;
    return p as typeof p & { close: (v?: ResultType) => void };
  };
}
