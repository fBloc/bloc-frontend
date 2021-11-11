import { SelectOption } from "@/api/bloc";
import { ValueType } from "@/api/flow";
import classNames from "classnames";
import React, { memo } from "react";
import { NumericInput, NumericInputProps } from "@blueprintjs/core";
export const SearchInput: React.FC<React.HTMLProps<HTMLInputElement>> = memo(({ className, ...rest }) => {
  return (
    <input
      type="text"
      placeholder="搜索关键词..."
      className={classNames(
        "flex-grow placeholder-gray-400 h-10 mr-4 rounded-lg bg-gray-50 border-solid border border-gray-200 px-2",
        className,
      )}
      {...rest}
    />
  );
});

export const NativeSelect: React.FC<{ options: SelectOption[]; value: ValueType; name?: string }> = ({
  options,
  value,
  name,
}) => {
  return (
    <div className="relative">
      <label htmlFor="s" className="z-10 relative">
        点我出现
      </label>
      <select className="absolute left-0 top-0" id="s" name={name} value={value?.toString()}>
        {options.map((item) => (
          <option value={item.value?.toString()} key={item.value?.toString()}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};
const getValue = (value: number, { min, max }: { min?: number; max?: number }) => {
  let result = value;
  if (min) {
    result = Math.max(min, value);
  }
  if (max) {
    result = Math.min(max, value);
  }
  return result;
};

export const EnhancedNumberInput: React.FC<NumericInputProps> = ({ min, max, onValueChange, ...rest }) => {
  return (
    <NumericInput
      {...rest}
      min={min}
      max={max}
      onValueChange={(v, ...rest) => {
        const vx = getValue(v, { min, max });
        if (!isNaN(v)) {
          onValueChange?.(vx, ...rest);
        }
      }}
    />
  );
};
