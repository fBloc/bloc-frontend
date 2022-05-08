import React from "react";
import Tooltip, { TooltipProps } from "../tooltip";

export type PopoverProps = TooltipProps & {
  //
};
const Popover = React.forwardRef<HTMLElement, TooltipProps>(({ children, ...rest }, ref) => {
  return (
    <Tooltip ref={ref} {...rest}>
      {children}
    </Tooltip>
  );
});
export default Popover;
