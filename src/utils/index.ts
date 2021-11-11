import dayjs from "dayjs";

export * from "./blueprint";

export function getReadableTime(timestamp: number) {
  if (timestamp <= 0) return "";
  const time = dayjs(timestamp).format("HH:mm");
  const daysAgo = dayjs(Date.now()).diff(timestamp, "days");
  const formatDaysAgo = daysAgo === 0 ? "今天" : `${daysAgo}天${daysAgo > 0 ? "前" : "后"}`;
  return `${formatDaysAgo} ${time}`;
}

export const sleep = (duration = 2000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

/**
 * 生成一个id，仅此而已
 */
export function simpleNanoId() {
  return Math.random().toString(16).slice(-4);
}

export function objectToQueryString(source: Record<string, string | number>) {
  return Object.entries(source)
    .reduce((acc: string, item: [string, string | number]) => {
      return `${acc}${item[0]}=${item[1]}&`;
    }, "?")
    .slice(0, -1);
}

export function isObject(source: any) {
  return Object.prototype.toString.call(source) === "[object Object]";
}
