import { FormControlType } from "@/shared/enums";
import { isValidValue, simpleNanoId } from "@/shared/tools";

/**
 * 对atom的数据纠错，以防类型不一致
 */
export function correctValue({
  isArray,
  value,
  formType,
  defaultValue,
}: {
  isArray: boolean;
  value?: unknown;
  formType: FormControlType;
  defaultValue: unknown;
}) {
  /**
   * select下不需处理值
   */
  const valueIsArray = Array.isArray(value);
  if (formType === FormControlType.select) {
    if (isArray) {
      return valueIsArray ? value.filter(isValidValue) : isValidValue(value) ? [value] : [];
    } else {
      return valueIsArray ? value[0] ?? "" : value ?? "";
    }
  }
  if (isArray && !valueIsArray) {
    return [
      {
        id: simpleNanoId(),
        value: defaultValue ?? "",
      },
    ];
  }
  if (!isArray && valueIsArray) {
    return value[0] ?? "";
  }
  if (isArray && valueIsArray) {
    return value.map((itemValue) => {
      return itemValue.id
        ? itemValue
        : {
            id: simpleNanoId(),
            value: itemValue ?? defaultValue,
          };
    });
  }
  return (value as any)?.toString() || "";
}
