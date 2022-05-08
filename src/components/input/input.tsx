import classNames from "classnames";
import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name?: string;
  block?: boolean;
};
const Input: React.FC<InputProps> = ({ className, block, ...rest }) => {
  return (
    <input
      className={classNames(
        "h-10 px-2 border-gray-100 border-solid border rounded-lg focus:border-primary-400",
        className,
        {
          "bg-gray-50 cursor-not-allowed": rest.disabled,
          "w-full": block,
        },
      )}
      {...rest}
    />
  );
};
export default Input;
