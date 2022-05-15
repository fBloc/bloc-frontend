import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import i18n from "@/i18n";
import "dayjs/locale/zh-cn";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.extend(relativeTime);
dayjs.extend(duration);

dayjs.extend(localizedFormat);

dayjs.locale(navigator.language);

const language = navigator.language === "zh-CN" ? "zh-cn" : "en";

export const readableDuration = (previous?: number | null, later?: number | null) => {
  if (!previous || !later) return "-";
  const asSeconds = dayjs.unix(later).diff(dayjs.unix(previous), "seconds");
  if (asSeconds === 0) return i18n.t("lessThanOneSecond");
  if (asSeconds < 60) {
    return dayjs.duration(asSeconds, "seconds").locale(language).humanize();
  }
  if (asSeconds < 3600) {
    return dayjs
      .duration(asSeconds / 60, "minutes")
      .locale(language)
      .humanize();
  }
  if (asSeconds < 3600 * 24) {
    return dayjs
      .duration(asSeconds / 3600, "hours")
      .locale(language)
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
