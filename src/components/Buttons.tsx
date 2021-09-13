import React, { memo } from "react";
import { Button, ButtonProps } from "@blueprintjs/core";
import classNames from "classnames";

export const ContainButton: React.FC<Omit<ButtonProps, "intent">> = memo(({ className, children, loading, disabled, ...rest }) => {
  return (
    <Button
      intent="primary"
      minimal
      loading={loading}
      disabled={disabled}
      className={classNames(
        "!rounded-md transition-bg !text-white",
        className,
        loading || disabled ? "!bg-gray-200" : "!bg-blue-400 hover:!bg-blue-500",
      )}
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
