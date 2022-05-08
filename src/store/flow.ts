import { getQuery } from "@/shared/tools";

export const extractVersion = () => {
  const version = getQuery<"version">().version;
  return typeof version === "string" ? version : version?.[0] || "";
};
