import classNames from "classnames";
import React, { forwardRef, useMemo } from "react";
import Loading from "../loading";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  block?: boolean;
  variant?: "default" | "plain" | "text";
  rounded?: boolean;
  loading?: boolean;
  size?: "small" | "normal";
  intent?: "danger" | "primary";
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      block,
      className,
      variant = "default",
      disabled,
      rounded = false,
      loading,
      intent,
      size = "normal",
      ...rest
    },
    ref,
  ) => {
    const hoverBgGray = useMemo(
      () => ["default", "plain"].includes(variant) && !disabled && !intent,
      [variant, disabled, intent],
    );

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={classNames("whitespace-nowrap", className, {
          "w-full": block,
          "font-medium": size !== "small",
          "bg-primary-400 hover:bg-primary-500 active:bg-primary-600 text-white":
            intent === "primary" && !disabled && variant === "default",
          "bg-red-400 hover:bg-red-500 active:bg-red-600": intent === "danger" && !disabled && variant === "default",
          "text-white": !disabled && variant === "default",
          "hover:bg-red-50 active:bg-red-100 text-red-400": !disabled && variant === "text" && intent === "danger",
          "hover:bg-primary-50 active:bg-primary-100 text-primary-400":
            !disabled && variant === "text" && intent === "primary",
          "text-gray-600": ["default", "plain"].includes(variant) && !disabled && !intent,
          "rounded-full inline-flex justify-center items-center": rounded,
          "pointer-events-none bg-gray-100 text-gray-400": disabled || loading,
          "bg-gray-50": variant === "default" && !disabled && !intent,
          "hover:bg-gray-100 active:bg-gray-200": hoverBgGray,
          "border border-solid": variant === "plain",
          "border-primary-400": intent === "primary" && variant === "plain" && !disabled,
          "border-red-400": intent === "danger" && variant === "plain" && !disabled,
          "text-primary-400 hover:bg-primary-50 active:bg-primary-100":
            intent === "primary" && ["plain", "text"].includes(variant),
          "text-red-400 hover:bg-red-50 active:bg-red-100": intent === "danger" && ["plain", "text"].includes(variant),
          "text-xs h-6": size === "small",
          "h-9": size === "normal",
          "w-6": rounded && size === "small",
          "w-9": rounded && size === "normal",
          "rounded-lg px-4": !rounded && size === "normal",
          "rounded px-2": !rounded && size === "small",
          "hover:bg-gray-50": variant === "text" && !disabled,
          loading,
        })}
        {...rest}
      >
        {loading && <Loading open className="inline-block mr-2" />}
        {children}
      </button>
    );
  },
);
export default Button;
