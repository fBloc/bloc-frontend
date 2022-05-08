import classNames from "classnames";
import React, { useMemo } from "react";

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (checked: boolean) => void;
};
const Switch: React.FC<SwitchProps> = ({ checked, defaultChecked, className, style, onChange, ...rest }) => {
  const internalChecked = useMemo(() => checked || defaultChecked, [checked, defaultChecked]);
  return (
    <label
      style={style}
      className={classNames(
        className,
        "h-6 rounded-full inline-block w-10 relative transition-colors",
        internalChecked ? "bg-primary-400" : "bg-gray-200 hover:bg-gray-300",
      )}
    >
      <span
        className={classNames(
          "bg-white w-6 h-6 rounded-full shadow inline-block absolute top-1/2 -translate-y-1/2 transition-all duration-200",
          {
            "left-0 translate-x-0": !internalChecked,
            "left-full -translate-x-full": internalChecked,
          },
        )}
      ></span>
      <input
        hidden
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onChange?.(e.target.checked);
        }}
        {...rest}
      />
    </label>
  );
};

export default Switch;
