import { observer } from "mobx-react-lite";
import React, { useCallback, useContext } from "react";
import { TextArea } from "@/components";
import { StoreContext as Context } from "../store";

// TODO 处理高度溢出
const CustomTextArea = observer(() => {
  const store = useContext(Context);
  const { param } = store;
  const { atomValue, atomDescriptor, editorReadonly } = param;
  // if (atomValue === null || (isTruthyValue(atomValue) && typeof atomValue !== "string")) return null;
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      param.updateSelectValue(e.currentTarget.value);
    },
    [param],
  );
  return (
    <TextArea
      disabled={editorReadonly}
      fill
      placeholder={atomDescriptor?.hint || "请输入"}
      growVertically={true}
      onChange={onChange}
      value={atomValue as string}
    />
  );
});

export default CustomTextArea;
