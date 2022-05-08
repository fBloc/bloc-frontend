import React, { memo, useCallback, useMemo } from "react";
import { ListItemText, MenuItem, OutlinedInput, Select, SelectProps, Button } from "@mui/material";
import { FixedSizeList } from "react-window";
import { isValidValue } from "@/shared/tools";
import { FaCheck } from "@/components/icons";

type OptionItem = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
};

const Row = ({
  index,
  style,
  options,
  value,
  isMultiple,
  onValueChange,
}: {
  index: number;
  style: React.CSSProperties;
  options: OptionItem[];
  value: unknown;
  isMultiple: boolean;
} & Pick<UserSelectProps, "onValueChange">) => {
  const item = useMemo(() => options[index], [options, index]);
  const isSelected = useMemo(() => {
    return isMultiple && Array.isArray(value) ? value.includes(item.value) : value === item.value;
  }, [isMultiple, value, item]);
  return (
    <MenuItem
      style={style}
      value={item.value}
      onClick={() => {
        if (isMultiple) {
          const isArray = Array.isArray(value);
          const _value = isArray ? value : [value].filter(isValidValue);
          const alreadyIn = _value.includes(item.value);
          onValueChange(alreadyIn ? _value.filter((v) => v !== item.value) : [..._value, item.value]);
        } else {
          onValueChange(item.value);
        }
      }}
    >
      <ListItemText primary={item.label} />
      {isSelected && <FaCheck size={12} />}
    </MenuItem>
  );
};

type UserSelectProps = SelectProps & {
  options: OptionItem[];
  isMultiple: boolean;
  defaultValue: unknown;
  onValueChange: (value: unknown) => void;
};
const UserSelect: React.FC<UserSelectProps> = ({
  options,
  isMultiple,
  onValueChange,
  defaultValue,
  value,
  ...props
}) => {
  const renderer = useCallback(
    (selected: unknown) => {
      const getLabel = (v: unknown) => {
        return options.find((option) => option.value === v)?.label;
      };
      if (Array.isArray(selected)) {
        return selected.map(getLabel).join(",");
      }
      return getLabel(selected);
    },
    [options],
  );
  const isUnset = Array.isArray(value) ? value.filter(isValidValue).length === 0 : !isValidValue(value);
  return (
    <Select
      {...props}
      multiple={isMultiple}
      input={<OutlinedInput />}
      renderValue={renderer}
      value={value ?? ""}
      endAdornment={
        isUnset && defaultValue ? (
          <Button
            size="small"
            sx={{ mr: 2, minWidth: 80 }}
            className="whitespace-nowrap"
            onClick={() => {
              const _value = isMultiple
                ? Array.isArray(defaultValue)
                  ? defaultValue
                  : [defaultValue]
                : Array.isArray(defaultValue)
                ? defaultValue[0]
                : defaultValue;
              onValueChange(_value); // TODO 提取逻辑
            }}
          >
            填入默认值
          </Button>
        ) : null
      }
    >
      <FixedSizeList itemSize={40} height={Math.min(200, 40 * options.length)} itemCount={options.length} width="100%">
        {(defaultProps) => Row({ ...defaultProps, options, value, isMultiple, onValueChange })}
      </FixedSizeList>
      {options.length === 0 && <p className="text-center py-5 text-gray-400">无可用项</p>}
    </Select>
  );
};

export default memo(UserSelect);
