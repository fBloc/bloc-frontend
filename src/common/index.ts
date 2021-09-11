export * from "./types";
export enum DetailType {
  launched = "launched",
  draft = "draft",
}

export const tabs = [
  {
    label: "已发布",
    value: DetailType.launched,
  },
  {
    label: "草稿",
    value: DetailType.draft,
  },
];
export enum RunningEnum {
  created = "创建成功",
  queue = "排队中",
  running = "运行中",
  success = "成功",
  failed = "失败",
}

export function isString(target: unknown): target is string {
  return typeof target === "string";
}

export function isTruthyValue<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}
export function isValidInputValue(value: unknown) {
  return isTruthyValue(value) && value !== "";
}

export enum EditType {
  create = "create",
  edit = "edit",
}

export function debounce(delay = 500) {
  let timer: number;
  return function (this: unknown, target: unknown, key: string | symbol, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      if (timer) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        fn.call(this, ...args);
      }, delay);
    };
  };
}

export function toRound(value: number, n: number) {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}
export function noop() {
  //
}
