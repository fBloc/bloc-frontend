import { Toaster, IToastProps } from "@blueprintjs/core";

export const instance = Toaster.create();

type OmitIndent = Omit<IToastProps, "intent">;

export function ToastPlugin(props: IToastProps) {
  return instance.show({
    ...props,
    timeout: props.timeout || 1500,
  });
}

ToastPlugin.success = (props: OmitIndent) =>
  ToastPlugin({
    ...props,
    intent: "success",
  });

ToastPlugin.error = (props: OmitIndent) =>
  ToastPlugin({
    ...props,
    intent: "danger",
  });

ToastPlugin.warning = (props: OmitIndent) =>
  ToastPlugin({
    ...props,
    intent: "warning",
  });
