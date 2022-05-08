import React, { useState } from "react";
import RCSelect, { BaseSelectRef, Option, SelectProps as SelectPropsAsRCSelectProps } from "rc-select";
import classNames from "classnames";
import { FaTimesCircle, FaCaretDown } from "@/components/icons";

import { OptionItem } from "./types";
import "./select.scss";

export type SelectProps = Partial<Omit<SelectPropsAsRCSelectProps, "options">> & {
  options?: OptionItem[];
};
const Select = React.forwardRef<BaseSelectRef, SelectProps>(({ dropdownClassName, options = [], ...rest }, ref) => {
  const [value, setValue] = useState([]);

  return (
    <>
      <RCSelect
        ref={ref}
        maxTagCount={1}
        value={value}
        mode="multiple"
        dropdownClassName={classNames("bloc-rc-select", dropdownClassName)}
        showSearch={false}
        onChange={setValue}
        allowClear={true}
        clearIcon={<FaTimesCircle className="text-gray-400" size={12} />}
        showArrow
        inputIcon={<FaCaretDown className="text-gray-400" size={14} />}
        notFoundContent={<div className="p-4 text-gray-400 text-center">没有可选项</div>}
        {...rest}
      >
        {options?.map((option) => (
          <Option value={option.value} key={option.value} disabled={option.disabled}>
            {option.label}
          </Option>
        ))}
      </RCSelect>
    </>
  );
});

export default Select;
