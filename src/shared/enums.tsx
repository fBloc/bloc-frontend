import React from "react";
import classNames from "classnames";
import { FaCheckCircle, FaTimesCircle, FaPauseCircle, FaStopCircle, FaBan } from "@/components/icons";
import { FlowDetailT, FlowRunningStatus } from "@/api/flow";
import i18n from "@/i18n";
/**
 * 参数设置值的类型
 */
export enum ParamValueType {
  int = "int",
  float = "float",
  string = "string",
  json = "json",
  bool = "bool",
}

/**
 * 运行状态枚举
 */
export enum RunningStatusEnum {
  created = 1,
  queue,
  running,
  userCancel,
  systemCancel,
  success,
  failed,
  /**
   * 被某个function拦截运行
   */
  intercepted,
  /**
   * 不被允许并行而取消
   */
  rejected,
}

export enum FlowListType {
  launched = "launched",
  draft = "draft",
}

const textClasses: Record<RunningStatusEnum, string> = {
  [RunningStatusEnum.created]: "text-warning",
  [RunningStatusEnum.queue]: "text-warning",
  [RunningStatusEnum.running]: "text-warning",
  [RunningStatusEnum.success]: "text-green-400",
  [RunningStatusEnum.systemCancel]: "text-red-400",
  [RunningStatusEnum.userCancel]: "text-red-400",
  [RunningStatusEnum.failed]: "text-red-400",
  [RunningStatusEnum.intercepted]: "text-red-400",
  [RunningStatusEnum.rejected]: "text-red-400",
};
const bgClasses: Record<RunningStatusEnum, string> = {
  [RunningStatusEnum.created]: "bg-warning bg-opacity-10",
  [RunningStatusEnum.queue]: "bg-warning bg-opacity-10",
  [RunningStatusEnum.running]: "bg-warning bg-opacity-10",
  [RunningStatusEnum.success]: "bg-green-50",
  [RunningStatusEnum.systemCancel]: "bg-red-50",
  [RunningStatusEnum.userCancel]: "bg-red-50",
  [RunningStatusEnum.failed]: "bg-red-50",
  [RunningStatusEnum.intercepted]: "bg-red-50",
  [RunningStatusEnum.rejected]: "bg-red-50",
};
const borderClasses: Record<RunningStatusEnum, string> = {
  [RunningStatusEnum.created]: "border-yellow-400",
  [RunningStatusEnum.queue]: "border-yellow-400",
  [RunningStatusEnum.running]: "border-yellow-400",
  [RunningStatusEnum.success]: "border-green-400",
  [RunningStatusEnum.systemCancel]: "border-red-400",
  [RunningStatusEnum.userCancel]: "border-red-400",
  [RunningStatusEnum.failed]: "border-red-400",
  [RunningStatusEnum.intercepted]: "border-red-400",
  [RunningStatusEnum.rejected]: "border-red-400",
};
export function getRunningStateClass(
  status?: RunningStatusEnum | null,
  { bg = false, text = true, border = false }: Partial<Record<"bg" | "text" | "border", boolean>> = {
    bg: false,
    text: true,
    border: false,
  },
  className = "",
) {
  const classes: string[] = [className];
  if (text) {
    classes.push(status ? textClasses[status] : "border-gray-400");
  }
  if (bg) {
    classes.push(status ? bgClasses[status] : "bg-gray-100");
  }
  if (border) {
    classes.push(status ? borderClasses[status] : "border-gray-100");
  }

  return classes.join(" ");
}

/**
 * 触发方式
 */
export enum TriggerTypes {
  user = 1,
  crontab,
  key,
}

// TODO 语意完善
export const getTriggerLabel = (type?: TriggerTypes) => {
  if (!type) return "-";
  const values = {
    [TriggerTypes.crontab]: "crontab",
    [TriggerTypes.key]: "key",
    [TriggerTypes.user]: i18n.t("manually"),
  };
  return values[type];
};

export const getTriggerValue = ({
  type,
  user,
  key,
  crontab,
}: {
  type: FlowRunningStatus["trigger_type"];
  user: FlowRunningStatus["trigger_user_name"];
  key: FlowRunningStatus["trigger_key"];
  crontab: FlowDetailT["crontab"];
}) => {
  const values = {
    [TriggerTypes.crontab]: crontab,
    [TriggerTypes.key]: key,
    [TriggerTypes.user]: user,
  };
  return values[type].trim() || "-";
};
export const runningStateTexts: Record<RunningStatusEnum, string> = {
  [RunningStatusEnum.created]: i18n.t("status.created", {
    ns: "flow",
  }),
  [RunningStatusEnum.queue]: i18n.t("status.queue", {
    ns: "flow",
  }),
  [RunningStatusEnum.running]: i18n.t("status.running", {
    ns: "flow",
  }),
  [RunningStatusEnum.userCancel]: i18n.t("status.userCanceled", {
    ns: "flow",
  }),
  [RunningStatusEnum.systemCancel]: i18n.t("status.timeoutCanceled", {
    ns: "flow",
  }),
  [RunningStatusEnum.success]: i18n.t("status.succeed", {
    ns: "flow",
  }),
  [RunningStatusEnum.failed]: i18n.t("status.failed", {
    ns: "flow",
  }),
  [RunningStatusEnum.intercepted]: i18n.t("status.intercepted", {
    ns: "flow",
  }),
  [RunningStatusEnum.rejected]: i18n.t("status.rejected", {
    ns: "flow",
  }),
};

export const getRunningStateText = (state?: RunningStatusEnum | null) => {
  if (!state)
    return i18n.t("status.neverRunned", {
      ns: "flow",
    });
  return runningStateTexts[state];
};
const icons: Record<RunningStatusEnum, JSX.Element> = {
  [RunningStatusEnum.created]: <FaCheckCircle />,
  [RunningStatusEnum.queue]: <FaPauseCircle />,
  [RunningStatusEnum.running]: <FaPauseCircle />,
  [RunningStatusEnum.userCancel]: <FaTimesCircle />,
  [RunningStatusEnum.systemCancel]: <FaStopCircle />,
  [RunningStatusEnum.success]: <FaCheckCircle />,
  [RunningStatusEnum.failed]: <FaTimesCircle />,
  [RunningStatusEnum.intercepted]: <FaBan />,
  [RunningStatusEnum.rejected]: <FaTimesCircle />,
};
export const getRunningIcon = (state?: RunningStatusEnum | null, className = "") => {
  if (!state) return null;
  const icon = icons[state];
  return icon
    ? React.cloneElement(icon, {
        className: classNames(className, ""),
      })
    : null;
};

/**
 * 表单输入类型
 */
export enum FormControlType {
  input = "input",
  select = "select",
  textarea = "textarea",
  json = "json",
}

export enum IptWay {
  Connection = "connection",
  UserIpt = "user_ipt",
}

export enum BlocNodeType {
  /**
   * 开始节点
   */
  start = "start",
  /**
   * 普通任务节点
   */
  job = "job",
}

export enum MergedIptParamStatus {
  unavaliable,
  avaliable,
  indeterminate,
}

export enum FlowDisplayPage {
  preview = "preview",
  flow = "detail",
  history = "history",
  draft = "draft",
}
