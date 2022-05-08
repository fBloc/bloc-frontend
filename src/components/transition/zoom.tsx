import React from "react";

import BaseTransition, { TransitionProps } from "./base";

export interface zoomProps extends Partial<TransitionProps> {}

const Zoom: React.FC<zoomProps> = (props) => {
  return <BaseTransition animationName="zoomIn" {...props} />;
};

export default Zoom;
