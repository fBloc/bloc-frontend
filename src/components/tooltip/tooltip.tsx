import React from "react";
import { Tooltip as MdTooltip, TooltipProps } from "@mui/material";

const Tooltip: React.FC<TooltipProps> = ({ title, children, ...rest }) => {
  if (!title) return <>{children}</>;
  return (
    <MdTooltip title={title} {...rest}>
      {children}
    </MdTooltip>
  );
};
export default Tooltip;
