import classNames from "classnames";
import React from "react";

const BaseNode: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...rest }) => {
  return (
    <div className={classNames("relative cursor-default", className)} {...rest}>
      {children}
    </div>
  );
};
export default BaseNode;
