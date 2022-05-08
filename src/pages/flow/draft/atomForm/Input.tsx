import React, { useCallback } from "react";
import { Tooltip } from "@mui/material";
import { Button, Input, InputProps } from "@/components";
import { FaPlus, FaTrashAlt } from "@/components/icons";
import { FormControlType, ParamValueType } from "@/shared/enums";
import { handleStringChange } from "@/shared/form";
import { simpleNanoId } from "@/shared/tools";
import { showToast } from "@/components/toast";
import NumbericInut from "@/components/input/numbericInput";
import TextArea from "./Textarea";
import JsonInput from "./Json";

const UnknownInput: React.FC<
  { valueType?: ParamValueType; formType: FormControlType } & Omit<InputProps, "onChange"> & {
      onChange: (e: React.FormEvent<HTMLElement>) => void;
    }
> = ({ valueType = ParamValueType.string, formType, maxLength, placeholder, ...rest }) => {
  if (formType === FormControlType.json) {
    return (
      <JsonInput
        value={rest.value}
        onChange={rest.onChange}
        placeholder={placeholder ?? __DEFAULT_JSON_PLACEHOLDER__}
        fullWidth
      />
    );
  }
  if (formType === FormControlType.textarea) {
    return (
      <TextArea
        value={rest.value}
        onChange={rest.onChange}
        className={rest.className}
        style={rest.style}
        maxLength={maxLength ?? __MAX_TEXTAREA_LENGTH__}
        placeholder={placeholder ?? __DEFAULT_TEXTAREA_PLACEHOLDER__}
      />
    );
  }
  if ([ParamValueType.int, ParamValueType.float].includes(valueType)) {
    return (
      <NumbericInut
        {...(rest as any)}
        maxLength={maxLength ?? __MAX_INPUT_LENGTH__}
        placeholder={placeholder ?? __DEFAULT_INPUT_PLACEHOLDER__}
        int={valueType === ParamValueType.int}
      />
    );
  }
  return (
    <Input
      {...rest}
      maxLength={maxLength ?? __MAX_INPUT_LENGTH__}
      placeholder={placeholder ?? __DEFAULT_INPUT_PLACEHOLDER__}
    />
  );
};
export type ListFormProps = {
  isArray?: boolean;
  valueType?: ParamValueType;
  formType: FormControlType;
  value: unknown;
  onValueChange: (value: any) => void;
};

const InputView: React.FC<ListFormProps> = ({ isArray, valueType, value, onValueChange, formType }) => {
  const appendData = useCallback(() => {
    if (!Array.isArray(value)) return;
    const lastValue = value[value.length - 1].value;
    if (lastValue === "" || lastValue === 0) {
      showToast({
        children: "前一条数据不能为空",
        autoHideDuration: 1000,
      });
      return;
    }
    onValueChange([
      ...value,
      {
        value: "",
        id: simpleNanoId(),
      },
    ]);
  }, [value, onValueChange]);
  if (!isArray) {
    return (
      <UnknownInput
        value={(value as any)?.toString() || ""}
        onChange={handleStringChange(onValueChange)}
        className="w-full"
        valueType={valueType}
        formType={formType}
      />
    );
  }
  if (isArray && Array.isArray(value)) {
    return (
      <>
        {value.map((item, index) => (
          <div key={item.id} className="flex items-center mb-2">
            <UnknownInput
              formType={formType}
              valueType={valueType}
              value={item.value}
              className="flex-grow mr-2"
              autoFocus
              onChange={(e) => {
                onValueChange(
                  value.map((previousItemValue) => {
                    return previousItemValue.id === item.id
                      ? {
                          ...previousItemValue,
                          value: (e.target as any).value.trim(),
                        }
                      : previousItemValue;
                  }),
                );
              }}
            />
            {index !== 0 && (
              <Tooltip title="删除这条数据">
                <Button
                  variant="text"
                  intent="danger"
                  size="small"
                  onClick={() => {
                    onValueChange(value.filter((p: any) => p.id !== item.id));
                  }}
                >
                  <FaTrashAlt />
                </Button>
              </Tooltip>
            )}
          </div>
        ))}
        <Button size="small" className="flex mx-auto items-center" onClick={appendData}>
          <FaPlus size={10} className="mr-2" />
          添加一条数据
        </Button>
      </>
    );
  }
  return null;
};

export default InputView;
