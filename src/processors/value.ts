import { FullStateAtom } from "@/api/flow";
import { ParamValueType } from "@/shared/enums";
import { isValidValue } from "@/shared/tools";

export const valueEqualsUnset = (atom: FullStateAtom) => {
  let unset = false;
  if ([undefined, null, ""].includes(atom.value as any)) {
    unset = true;
  }
  if (atom.isArray) {
    if (!Array.isArray(atom.value) || atom.value.filter(isValidValue).length === 0) {
      unset = true;
    }
  }
  if (atom.valueType === ParamValueType.json) {
    if (JSON.stringify(atom.value) === "{}") {
      unset = true;
    }
  }
  return unset;
};
