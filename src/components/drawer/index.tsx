import classNames from "classnames";
import React from "react";
import { DialogProps } from "../dialog";
import Overlay from "../overlay";
import { Slide } from "../transition";

export type DrawerProps = DialogProps & {
  //
};
const Drawer: React.FC<DrawerProps> = ({ open, className, children, ...rest }) => {
  return (
    <Overlay open={open} className={classNames(className, "z-10 flex justify-end")} {...rest}>
      <Slide className="h-full bg-white" direction="right" open={open}>
        {children}
      </Slide>
    </Overlay>
  );
};

export default Drawer;
