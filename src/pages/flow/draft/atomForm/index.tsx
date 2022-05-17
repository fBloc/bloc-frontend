import React, { useCallback, useMemo } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useFormikContext } from "formik";
import { FormControlType, IptWay, ParamValueType } from "@/shared/enums";
import InputView from "./UserInput";
import { DEFAULT_EDIT_ATOM_DESCCRIPTOR } from "@/shared/defaults";
import Connection from "./Connection";
import { atomEditState, AtomKey, currentBlocNodeId } from "@/recoil/flow/node";
import { operationRecords } from "@/recoil/flow/param";
import UserSelet from "./UserSelect";
import { useSetAtomValue } from "@/recoil/hooks/useSetAtomValue";

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
  const currentAtom = useRecoilValue(atomEditState(key));
  const setAtomValue = useSetAtomValue();
  const setRecords = useSetRecoilState(operationRecords);
  const { setFieldValue } = useFormikContext();
  const {
    valueType,
    formType,
    description,
    isArray,
    selectOptions,
    iptWay,
    defaultValue,
    sourceNode,
    sourceParam,
    nodeId,
    parentParam,
  } = currentAtom || DEFAULT_EDIT_ATOM_DESCCRIPTOR;

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
          if (Array.isArray(value)) {
            _value = value.map(Number);
          } else {
            _value = Number(value);
          }
        }
        setFieldValue(name, _value);
      }
    },
    [name, setFieldValue, valueType],
  );
  const onConnectionReset = useCallback(() => {
    setAtomValue(key, "", true);
    setRecords((prevoious) => [
      ...prevoious,
      {
        type: "disconnect",
        source: {
          nodeId: sourceNode,
          param: sourceParam,
        },
        target: {
          nodeId: nodeId || "",
          param: parentParam,
          atomIndex,
        },
      },
    ]);
  }, [atomIndex, sourceNode, sourceParam, nodeId, parentParam, setRecords, setAtomValue, key]);
  if (iptWay === IptWay.Connection) {
    return <Connection value={currentAtom} onReset={onConnectionReset} />;
  }
  switch (formType) {
    case FormControlType.select:
      return (
        <UserSelet
          fullWidth
          name={name || ""}
          placeholder={description ?? __DEFAULT_SELECT_PLACEHOLDER__}
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
          placeholder={description ?? __DEFAULT_INPUT_PLACEHOLDER__}
          value={value}
          name={name || ""}
          onChange={onChange}
        />
      );
  }
};

export default AtomForm;
