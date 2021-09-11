import React, { useCallback, useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { ParamTypeOptions, toRound } from "@/common";
import { StoreContext as Context } from "../store";
import { Button, InputGroupProps2, InputGroup, NumericInput } from "@/components";

type NumberInputProps = React.HTMLProps<HTMLInputElement> & {
  numType: "float" | "int";
  index?: number;
  precision?: number;
};

const NumberInput: React.FC<NumberInputProps> = observer((props) => {
  const { index = -1, numType, placeholder, precision = 2 } = props;
  const { param: store } = useContext(Context);
  const [initialValue, setInitialValue] = useState<number | undefined>(0);
  const backup = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.currentTarget.value) {
      setInitialValue(undefined);
      return;
    }
    const v = Number(e.currentTarget.value);
    setInitialValue(isNaN(v) ? undefined : v);
  }, []);
  const handleChange = useCallback(
    (value: number, asString: string) => {
      store.updateInputFieldValue(asString, index);
    },
    [store, index],
  );
  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const asString = e.target.value.trim();
      if (asString === "") {
        return store.updateInputFieldValue(undefined, index);
      }
      const asNumber = numType === "int" ? parseInt(asString) : parseFloat(asString);
      const realValue = isNaN(asNumber) ? initialValue : numType === "float" ? toRound(asNumber, precision) : asNumber;

      store.updateInputFieldValue(isNaN(realValue as number) ? "" : realValue, index);
    },
    [initialValue, store, index, numType, precision],
  );
  return (
    <>
      <NumericInput
        fill
        placeholder={placeholder}
        disabled={store.editorReadonly}
        onFocus={backup}
        minorStepSize={0.00001}
        allowNumericCharactersOnly={false}
        value={store.atomValue as number}
        onValueChange={handleChange}
        onBlur={onBlur}
      />
    </>
  );
});

type ITextInputProps = InputGroupProps2 & { index?: number };

const TextInput: React.FC<ITextInputProps> = observer(({ index = -1, ...rest }) => {
  const { param: store } = useContext(Context);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.updateInputFieldValue(e.target.value, index);
  };

  return (
    <InputGroup
      disabled={store.editorReadonly}
      onChange={handleChange}
      value={store.getIndexAtomValue(index)?.toString() || ""}
      {...rest}
    />
  );
});

const InputFieldItem: React.FC<{
  index?: number;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}> = observer((props) => {
  const { param } = useContext(Context);
  const { atomDescriptor } = param;
  if (!atomDescriptor) return null;
  const { value_type } = atomDescriptor;
  switch (value_type) {
    case ParamTypeOptions.string:
      return <TextInput {...props} />;
    case ParamTypeOptions.int:
    case ParamTypeOptions.float:
      return <NumberInput numType={value_type === ParamTypeOptions.int ? "int" : "float"} {...props} />;
  }
  return null;
});

const InputField: React.FC<{ multiple?: boolean }> = observer(() => {
  const { param } = useContext(Context);
  const { atomDescriptor, atomValue } = param;
  const deleteItem = useCallback(
    (index: number) => {
      param.removeAtomItem(index);
    },
    [param],
  );

  if (!atomDescriptor) return null;
  const { allow_multi, hint } = atomDescriptor;

  return allow_multi && Array.isArray(atomValue) ? (
    <div>
      {atomValue.map((item, index) => (
        <div key={index} className="mt-4 flex items-center">
          <InputFieldItem placeholder={hint} index={index} className="mr-4 flex-grow" />
          <Button
            icon="trash"
            intent="danger"
            minimal
            onClick={() => {
              param.removeAtomItem(index);
            }}
          />
        </div>
      ))}
      <Button
        icon="plus"
        minimal
        className="mt-5 mx-auto block"
        onClick={() => {
          param.addAtomItem();
        }}
      >
        添加一项
      </Button>
    </div>
  ) : (
    <InputFieldItem placeholder={hint} />
  );
});
// TODO key问题
export default InputField;
