import classNames from "classnames";
import React from "react";

export type LoadingFlowProps = React.HTMLProps<HTMLDivElement>;
const LoadingFlow: React.FC<LoadingFlowProps> = ({ className, ...rest }) => {
  return (
    <div className={classNames(className, "flex items-center justify-center bg-[#f9fafb]")} {...rest}>
      loading...
    </div>
  );
};

export default LoadingFlow;
