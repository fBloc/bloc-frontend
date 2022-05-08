import { Nullable } from "@/shared/types";
import React, { useCallback, useState } from "react";
import InputNumber, { InputNumberProps } from "rc-input-number";
import "./numberic-input.scss";

const normalizeValue = (value: number, { int, fixed }: { int?: boolean; fixed?: number }) => {
  if (int) return Math.trunc(value);
  return Number(value.toFixed(fixed || 2));
};

export const getValidValue = (
  value: Nullable<string>,
  fallback: string,
  {
    int,
    fixed,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
  }: { int?: boolean; fixed?: number; min?: number; max?: number },
) => {
  if (value?.trim() === "") return "";
  const asNumber = Number(value);
  const isNumber = typeof asNumber === "number" && !isNaN(asNumber);
  if (!isNumber || !value) return fallback || "";
  const v = int ? parseInt(value) : Number(asNumber.toFixed(fixed || 2));
  const invalidMin = normalizeValue(min, { int, fixed });
  const invalidMax = normalizeValue(max, { int, fixed });
  return `${Math.min(Math.max(v, invalidMin), invalidMax)}`;
};
export type NumbericInputProps = Omit<InputNumberProps, "onChange"> & {
  int?: boolean;
  fixed?: number;
  min?: number;
  max?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};
const NumbericInut: React.FC<NumbericInputProps> = ({ min, max, onFocus, onBlur, int, onChange, ...rest }) => {
  const onScopeFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
      // setInitiateValue(e.target.value);
    },
    [onFocus],
  );
  const onScopeBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
    },
    [onBlur],
  );
  const interOnChange = useCallback(
    (v: string | number) => {
      onChange?.({
        target: {
          value: v,
        },
      } as any);
    },
    [onChange],
  );
  return (
    <InputNumber
      onChange={interOnChange}
      min={min}
      max={max}
      step={int ? 1 : 0.01}
      onFocus={onScopeFocus}
      onBlur={onScopeBlur}
      {...rest}
    />
  );
};

export default NumbericInut;
