import React from "react";
import { Spinner } from "@blueprintjs/core";
import classNames from "classnames";

export const Loading: React.FC<React.HTMLProps<HTMLDivElement>> = ({ className, ...rest }) => {
  return (
    <div
      className={classNames("left-1/2 top-1/2 bg-white p-4 rounded -translate-x-1/2 -translate-y-1/2", className)}
      {...rest}
    >
      <Spinner />
    </div>
  );
};
