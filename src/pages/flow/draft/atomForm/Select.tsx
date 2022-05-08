import React from "react";
import { Tooltip } from "@mui/material";
import { FaRegQuestionCircle } from "@/components/icons";
import { Select, SelectProps } from "@/components/select";
import { Button } from "@/components";
import { FullStateAtom } from "@/api/flow";

export type AtomSelectProps = SelectProps & Pick<FullStateAtom, "isArray" | "defaultValue" | "unset">;
const AtomSelect: React.FC<AtomSelectProps> = ({ isArray, placeholder, defaultValue, unset, ...props }) => {
  return (
    <div className="relative">
      <Select
        mode={isArray ? "multiple" : undefined}
        {...props}
        placeholder={placeholder || __DEFAULT_SELECT_PLACEHOLDER__}
      />
      {!isArray && unset && defaultValue && (
        <div className="flex justify-end items-center absolute right-6 top-1/2 -translate-y-1/2 bg-white">
          <Button
            intent="primary"
            size="small"
            variant="text"
            className="inline-flex items-center"
            onClick={() => {
              props.onChange?.(defaultValue, []);
            }}
          >
            填入默认值
            <Tooltip title="函数提供方预置的默认值" placement="right">
              <span className="ml-1">
                <FaRegQuestionCircle size={12} className="text-primary-400 cursor-pointer" />
              </span>
            </Tooltip>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AtomSelect;
