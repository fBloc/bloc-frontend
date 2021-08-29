import React, { memo } from "react";
import { Button, ButtonProps } from "@blueprintjs/core";
import classNames from "classnames";

export const ContainButton: React.FC<Omit<ButtonProps, "intent">> = memo(({ className, children, ...rest }) => {
  return (
    <Button
      intent="primary"
      minimal
      className={classNames("!bg-blue-400 hover:!bg-blue-500 !rounded-md transition-bg !text-white", className)}
      {...rest}
    >
      {children}
    </Button>
  );
});

export const PlainButton: React.FC<Omit<ButtonProps, "intent">> = memo(({ className, children, ...rest }) => {
  return (
    <Button
      minimal
      className={classNames(
        "border-solid border border-blue-400 !text-blue-400 !rounded-md hover:!bg-blue-400 hover:!bg-opacity-10 transition-bg",
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  );
});
