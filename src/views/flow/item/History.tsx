import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React from "react";

const History = observer<React.HTMLProps<HTMLDivElement>, HTMLDivElement>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={classNames(className, "p-4 w-80")} {...rest}>
        lishoty
      </div>
    );
  },
  {
    forwardRef: true,
  },
);

export default History;
