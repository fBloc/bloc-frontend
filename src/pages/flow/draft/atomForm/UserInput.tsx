import React, { useMemo } from "react";
import { get } from "lodash-es";
import { Button, TextField, TextFieldProps, IconButton, Tooltip } from "@mui/material";
import { FaTrashAlt } from "@/components/icons";
import { FieldArray, useFormikContext } from "formik";
import { FormControlType, ParamValueType } from "@/shared/enums";
import { FaPlus } from "@/components/icons";
import { simpleNanoId } from "@/shared/tools";

const UserInputItem: React.FC<TextFieldProps> = ({ ...props }) => {
  const { errors } = useFormikContext();
  const _name = props.name || "";
  const errorMessage = get(errors, _name);
  return (
    <>
      <TextField fullWidth {...props} label={errorMessage} error={errorMessage !== undefined} />
    </>
  );
};

type UserInputProps = TextFieldProps & {
  isArray: boolean;
  formType: FormControlType;
  valueType: ParamValueType;
};
const UserInput: React.FC<UserInputProps> = ({ isArray, formType, valueType, name, ...props }) => {
  const { values } = useFormikContext();
  const inputType = useMemo(
    () => ([ParamValueType.int, ParamValueType.int].includes(valueType) ? "number" : "text"),
    [valueType],
  );
  if (isArray) {
    return (
      <FieldArray
        name={name || ""}
        render={(arrayHelpers) => {
          return (
            <>
              {(props.value as Array<{ id: string; value: unknown }>).map((item, index) => (
                <div key={item.id} className="mb-3">
                  <UserInputItem
                    {...props}
                    name={`${name || ""}[${index}].value`}
                    value={get(values, `${name || ""}[${index}].value`)}
                    autoFocus
                    InputProps={{
                      endAdornment: index === 0 ? null : null,
                    }}
                    type={inputType}
                  />
                  <Button
                    size="small"
                    className="flex mx-auto items-center"
                    onClick={() => {
                      arrayHelpers.push({
                        id: simpleNanoId(),
                        value: "",
                      });
                    }}
                  >
                    <FaPlus size={10} className="mr-2" />
                    添加一条数据
                  </Button>
                </div>
              ))}
            </>
          );
        }}
      />
    );
  }

  return <UserInputItem name={name || ""} type={inputType} {...props} />;
};
export default UserInput;
