import React from "react";
import BaseTransition, { TransitionProps } from "./base";

export interface SldieProps extends Partial<TransitionProps> {
  direction?: "left" | "top" | "right" | "bottom";
}

const aniamtions = {
  left: "slideInLeft",
  top: "slideInDown",
  right: "slideInRight",
  bottom: "slideInUp",
};
const Slide: React.FC<SldieProps> = ({ direction = "left", ...rest }) => {
  return <BaseTransition animationName={aniamtions[direction]} {...rest} />;
};

export default Slide;
