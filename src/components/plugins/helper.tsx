import React from "react";
import ReactDOM from "react-dom";
import { Noop } from "@/common";
export interface IBasicPluginProps<T> {
  resolve?: (value: T) => void;
  afterClose?: Noop;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IPluginProps<T = any> extends IBasicPluginProps<T> {
  open: boolean;
  destroy?: Noop;
}
export function plugin<T extends IPluginProps>(Component: React.FC<T>, append = true) {
  return (componentProps: Omit<T, "open">) => {
    type ResultType = T extends { resolve?: (value: infer P) => void } ? P : never;
    return new Promise<ResultType>((resolve) => {
      const div = document.createElement("div");
      append && document.body.appendChild(div);
      const destroy = () => {
        const unmounted = ReactDOM.unmountComponentAtNode(div);
        if (unmounted && div.parentElement) {
          div.parentElement.removeChild(div);
        }
      };
      const afterClose = () => {
        render({
          ...(componentProps as T),
          open: false,
        });
      };
      const render = (props: T) => {
        ReactDOM.render(
          React.cloneElement(<Component {...props} />, {
            resolve,
            destroy,
            afterClose,
          }),
          div,
        );
      };
      render({
        ...(componentProps as T),
        open: true,
      });
    });
  };
}
