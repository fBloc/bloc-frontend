import { PureQuery } from "./types";
import { nanoid } from "nanoid";
/**
 * 生成一个id，仅此而已
 */
export function simpleNanoId() {
  return Math.random().toString(16).slice(-4);
}

export function blocId() {
  return nanoid();
}

export function isObject(source: any) {
  return Object.prototype.toString.call(source) === "[object Object]";
}

export function setQueryString(value: PureQuery) {
  const entries = Object.entries(value);
  if (entries.length === 0) return "";
  return Object.entries(value).reduce((acc: string, item) => {
    return item[1] !== undefined ? `${acc}${item[0]}=${item[1]}&` : acc;
  }, "?");
}

export function mergeUrlQuery(url: string, query: PureQuery) {
  const queryAsStr = setQueryString(query);
  const urlHasQuery = url.includes("?");
  const queyrSymbol = urlHasQuery && !url.endsWith("&") ? "&" : "";
  return `${url}${queyrSymbol}${queryAsStr.slice(urlHasQuery ? 1 : 0)}`;
}

export function isTruthyValue<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export const formatText = (source: string | number = "", fallback = "-") => {
  return source !== "" ? source : fallback;
};
export function isValidValue(value: unknown) {
  return isTruthyValue(value) && value !== "";
}
