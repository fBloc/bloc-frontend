import React from "react";
import { TextArea as OriginTextArea, TextAreaRef, TextAreaProps } from "@/components";

const TextArea = React.forwardRef<TextAreaRef, TextAreaProps>((props, ref) => {
  return <OriginTextArea ref={ref} autoSize {...props} />;
});

export default TextArea;
