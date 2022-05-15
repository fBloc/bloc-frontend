import React from "react";
import i18n from "@/i18n";
export const TextFallback = (text?: string | number, fallback = i18n.t("noData")) => {
  return text?.toString() || <span className="italic">{fallback}</span>;
};
