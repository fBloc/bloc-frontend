import React from "react";
import { FaChevronDown } from "@/components/icons";
import classNames from "classnames";

export type OptionItem = {
  disabled?: boolean;
  label: React.ReactNode;
  value: string | number;
};
export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: OptionItem[];
};
const NativeSelect: React.FC<NativeSelectProps> = ({ className, options, placeholder, ...rest }) => {
  return (
    <label className="relative block">
      <select
        className={classNames("w-full p-2 appearance-none border border-solid rounded-lg border-gray-200", className)}
        placeholder={placeholder}
        {...rest}
      >
        <option disabled selected value="">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="bg-white absolute top-1 bottom-1 right-1 pr-2 inline-flex items-center rounded-lg">
        <FaChevronDown size={10} />
      </span>
    </label>
  );
};

export default NativeSelect;

export { default as Select } from "./select";
export * from "./select";
