import React from "react";
import RCTextArea, { TextAreaProps } from "rc-textarea";
import classNames from "classnames";
import "./textarea.scss";

const TextArea = React.forwardRef<RCTextArea, Partial<TextAreaProps>>(({ className, prefixCls, ...props }, ref) => {
  return <RCTextArea ref={ref} autoSize prefixCls={classNames("bloc-textarea", prefixCls, className)} {...props} />;
});

export default TextArea;
export type { TextAreaProps } from "rc-textarea";

export type TextAreaRef = RCTextArea;
