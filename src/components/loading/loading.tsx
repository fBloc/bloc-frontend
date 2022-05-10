import React from "react";
import { CircularProgress, CircularProgressProps } from "@mui/material";

const Loading: React.FC<CircularProgressProps> = ({ children, ...rest }) => {
  return (
    <>
      <CircularProgress {...rest} />
      {children}
    </>
  );
};
export default Loading;
