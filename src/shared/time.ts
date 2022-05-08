import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/zh-cn";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.extend(relativeTime);
dayjs.extend(duration);

dayjs.extend(localizedFormat);

dayjs.locale(navigator.language);

export const diffSeconds = (previous?: number | null, later?: number | null) => {
  if (!previous || !later) return "-";
  const asSeconds = dayjs.unix(later).diff(dayjs.unix(previous), "seconds");
  if (asSeconds === 0) return "不到1秒";
  if (asSeconds < 60) {
    return `${asSeconds}秒`;
  }
  if (asSeconds < 3600) {
    return dayjs
      .duration(asSeconds / 60, "minutes")
      .locale("zh-cn")
      .humanize();
  }
  if (asSeconds < 3600 * 24) {
    return dayjs
      .duration(asSeconds / 3600, "hours")
      .locale("zh-cn")
      .humanize();
  }

  // 超过一天
  return dayjs
    .duration(asSeconds / 3600 / 24, "days")
    .locale("zh-cn")
    .humanize();
};

export const readableTime = (time?: number | null) => {
  return time
    ? dayjs
        .unix(time)
        .local()
        .format(navigator.language === "zh-CN" ? "YYYY/MM/DD HH:mm:ss" : "lll")
    : "-";
};
