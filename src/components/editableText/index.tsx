import React from "react";
import { InputBase, InputBaseProps } from "@mui/material";
import classNames from "classnames";

const EditableText = React.forwardRef<HTMLInputElement, InputBaseProps>(({ inputProps, ...rest }, ref) => {
  return (
    <InputBase
      ref={ref}
      fullWidth
      inputProps={{
        ...inputProps,
        className: classNames("overflow-hidden text-ellipsis whitespace-nowrap", inputProps?.className),
      }}
      {...rest}
    />
  );
});

export default EditableText;
