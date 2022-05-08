import React from "react";
import RcTooltip from "rc-tooltip";
import { TooltipProps as RCTooltipProps } from "rc-tooltip/lib/Tooltip";
import "rc-tooltip/assets/bootstrap.css";

export type TooltipProps = {
  content?: React.ReactNode;
  children?: React.ReactElement;
} & Omit<RCTooltipProps, "overlay">;

const Tooltip = React.forwardRef<HTMLElement, TooltipProps>(({ children, content, ...rest }, ref) => {
  return (
    <RcTooltip overlay={content} {...rest} ref={ref}>
      {children}
    </RcTooltip>
  );
});
export default Tooltip;
