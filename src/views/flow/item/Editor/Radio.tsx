import React, { useContext, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { StoreContext as Context } from "../store";
import { getTruthyOptions, transformValue } from "../store/param";
import { RadioGroup, Radio } from "@/components";

const ScopeRadio = observer(() => {
  const store = useContext(Context);
  const { param } = store;
  const { atomValue, atomDescriptor } = param;
  const options = useMemo(() => atomDescriptor?.select_options || [], [atomDescriptor?.select_options]);
  const onValueChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      param.updateSelectValue(transformValue(options[0]?.value ?? "", e.currentTarget.value));
    },
    [param, options],
  );

  return (
    <RadioGroup
      label={atomDescriptor?.hint || "请选择"}
      name="group"
      onChange={onValueChange}
      selectedValue={atomValue as any}
      disabled={param.editorReadonly}
    >
      {getTruthyOptions(options).map((item, index) => (
        <Radio key={index} value={item.value} label={item.label} />
      ))}
    </RadioGroup>
  );
});
export default ScopeRadio;
