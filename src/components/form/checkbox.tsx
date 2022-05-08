import classNames from "classnames";
import React from "react";
import { FaCheck } from "../icons/";
export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;
const Checkbox: React.FC<CheckboxProps> = ({ checked, children, className, style, ...rest }) => {
  return (
    <>
      <label className={classNames(className, "select-none")} style={style}>
        <input type="checkbox" checked={checked} {...rest} hidden />
        <span
          className={classNames(
            "inline-flex items-center flex-shrink-0 justify-center w-4 h-4 border border-solid rounded",
            {
              "bg-primary-400 border-primary-400": checked,
              "shadow-inner": !checked,
            },
          )}
        >
          <FaCheck
            size={10}
            className={classNames("text-white", {
              invisible: !checked,
            })}
          />
        </span>
        {children}
      </label>
    </>
  );
};
export default Checkbox;
