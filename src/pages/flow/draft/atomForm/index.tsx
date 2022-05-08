import React, { useCallback, useMemo } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { FormControlType, IptWay, ParamValueType } from "@/shared/enums";
import InputView from "./UserInput";
import { DEFAULT_EDIT_ATOM_DESCCRIPTOR } from "@/shared/defaults";
import Connection from "./Connection";
import { atomEditState, AtomKey, currentBlocNodeId } from "@/recoil/flow/node";
import { getDefaultEditAtom } from "@/processors";
import { valueEqualsUnset } from "@/processors/value";
import { operationRecords } from "@/recoil/flow/param";
import UserSelet from "./UserSelect";
import { useFormikContext } from "formik";

export type AtomFormProps = {
  param: string;
  atomIndex: number;
  name?: string;
  value: unknown;
  onChange: React.ChangeEventHandler;
};
const AtomForm: React.FC<AtomFormProps> = ({ param, atomIndex, name, value, onChange }) => {
  const currenBlocId = useRecoilValue(currentBlocNodeId);
  const key = `${currenBlocId}_${param}_${atomIndex}` as AtomKey;
  const [currentAtom, setCurrentAtom] = useRecoilState(atomEditState(key));
  const setRecords = useSetRecoilState(operationRecords);
  const { setFieldValue } = useFormikContext();
  const {
    valueType,
    formType,
    description,
    isArray,
    selectOptions,
    iptWay,
    unset,
    defaultValue,
    sourceNode,
    sourceParam,
    targetNode,
    targetParam,
    atomIndex: _atomIndex,
  } = currentAtom || DEFAULT_EDIT_ATOM_DESCCRIPTOR;
  const setScopeValue = useCallback(
    (value: unknown, reset = false) => {
      setCurrentAtom((previous) => {
        const result = {
          ...previous,
          value,
          unset: valueEqualsUnset({
            ...previous,
            value,
          }),
        };
        return {
          ...result,
          ...(reset ? getDefaultEditAtom(result) : {}),
        };
      });
    },
    [setCurrentAtom],
  );
  const normalizedOptions = useMemo(() => {
    return (
      selectOptions?.map((item) => ({
        label: item.label.toString(),
        value: typeof item.value === "number" ? item.value : item.value.toString(),
      })) || []
    );
  }, [selectOptions]);
  const onSelectValueChange = useCallback(
    (value: unknown) => {
      if (name) {
        let _value = value;
        if ([ParamValueType.int, ParamValueType.float].includes(valueType)) {
          _value = Number(value);
        }
        setFieldValue(name, _value);
      }
    },
    [name, setFieldValue, valueType],
  );
  if (iptWay === IptWay.Connection) {
    return (
      <Connection
        value={currentAtom}
        onReset={() => {
          setScopeValue(null, true);
          setRecords((prevoious) => [
            ...prevoious,
            {
              type: "disconnect",
              source: {
                nodeId: sourceNode,
                param: sourceParam,
              },
              target: {
                nodeId: targetNode || "",
                param: targetParam,
                atomIndex: _atomIndex,
              },
            },
          ]);
        }}
      />
    );
  }
  switch (formType) {
    case FormControlType.select:
      return (
        <UserSelet
          fullWidth
          name={name || ""}
          placeholder={description}
          isMultiple={isArray}
          defaultValue={defaultValue}
          value={value}
          options={normalizedOptions}
          onValueChange={onSelectValueChange}
        />
      );
    case FormControlType.input:
    case FormControlType.textarea:
    case FormControlType.json:
      return (
        <InputView
          isArray={isArray}
          formType={formType}
          valueType={valueType}
          value={value}
          name={name || ""}
          onChange={onChange}
        />
      );
  }
};

export default AtomForm;
