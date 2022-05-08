import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

const JsonInput: React.FC<TextFieldProps> = (props) => {
  return <TextField {...props} />;
};

export default JsonInput;
