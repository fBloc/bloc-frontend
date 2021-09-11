import React from "react";
import { ParamTypeOptions } from "@/common";
import "./index.scss";

export type ITypeTagProps = {
  value: ParamTypeOptions;
  ghost?: boolean;
};

const TypeTag = React.forwardRef<HTMLSpanElement, React.HTMLProps<HTMLSpanElement> & ITypeTagProps>((props, ref) => {
  const { className = "", value, ghost, ...rest } = props;
  return (
    <span className={`type-tag ${className} ${value} ${ghost ? "ghost" : ""}`} ref={ref} {...rest}>
      {value}
    </span>
  );
});

export default TypeTag;
