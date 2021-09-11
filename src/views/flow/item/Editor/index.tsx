import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { StoreContext } from "../store";
import InputField from "./InputField";
import Json, { JsonInput } from "./Json";
import SingleSelect, { MultipleSelect } from "./Select";
import TextArea from "./TextArea";
import Radio from "./Radio";
import ListValue from "./ListValue";
const Editor = observer(() => {
  const {
    param: { isJson, isRadio, isMultipleInput, isMultipleSelect, isSingleSelect, atomDescriptor },
  } = useContext(StoreContext);
  // return <Json />;
  if (isSingleSelect) return <SingleSelect />;
  if (isMultipleSelect) return <MultipleSelect />;
  if (isRadio) return <Radio />;
  if (isJson) return <Json />;
  if (isMultipleInput) return <ListValue />;
  return <InputField />;
});

export default Editor;
