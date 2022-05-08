import React from "react";
import Button, { ButtonProps } from "./button";
import classNames from "classnames";
const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className, ...rest }, ref) => {
  return (
    <Button className={classNames("p-2 hover:bg-gray-50 active:bg-gray-100", className)} ref={ref} {...rest}>
      {children}
    </Button>
  );
});
export default IconButton;
