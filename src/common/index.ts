export * from "./types";
export enum TabEnums {
  launched = "launched",
  draft = "draft",
}

export const tabs = [
  {
    label: "已发布",
    value: TabEnums.launched,
  },
  {
    label: "草稿",
    value: TabEnums.draft,
  },
];
export enum RunningEnum {
  created = "创建成功",
  queue = "排队中",
  running = "运行中",
  success = "成功",
  failed = "失败",
}
