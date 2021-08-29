import classNames from "classnames";
import React, { memo } from "react";

export const SearchInput: React.FC<React.HTMLProps<HTMLInputElement>> = memo(({ className, ...rest }) => {
  return (
    <input
      type="text"
      placeholder="搜索关键词..."
      className={classNames(
        "flex-grow placeholder-gray-400 h-10 mr-4 rounded-lg bg-gray-50 border-solid border border-gray-200 px-2",
        className,
      )}
      {...rest}
    />
  );
});
