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
