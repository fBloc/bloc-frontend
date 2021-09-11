import React from "react";
import BaseTransition, { TransitionProps } from "./base";

export interface FadeProps extends Partial<TransitionProps> {}

const Fade: React.FC<FadeProps> = (props) => {
  return <BaseTransition animationName="fadeIn" {...props} />;
};

export default Fade;
