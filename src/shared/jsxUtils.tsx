import React from "react";

export const TextFallback = (text?: string | number, fallback = "缺少数据") => {
  return text?.toString() || <span className="italic">{fallback}</span>;
};
