import { noop } from "@/common";
import { Button, ContainButton, Divider, MenuItem, Switch } from "@/components";
import { ItemRenderer, Select, MultiSelect } from "@blueprintjs/select";
import classNames from "classnames";
import React, { useState } from "react";
import { FixedSizeList } from "react-window";

interface OptionItem {
  label: string | number;
  value: string | number;
}
const minuteOptions = [];
const hourOptions = [];
const monthDateOptions = [];
const monthOptions = [];
const weekDayOptions: OptionItem[] = [];
const map = {
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
  7: "日",
};
for (let i = 0; i < 60; i++) {
  minuteOptions.push({
    label: i,
    value: i,
  });
}
for (let i = 0; i < 24; i++) {
  hourOptions.push({
    label: `${i}点`,
    value: i,
  });
}
for (let i = 1; i < 32; i++) {
  monthDateOptions.push({
    label: `${i}号`,
    value: i,
  });
}
for (let i = 1; i < 13; i++) {
  monthOptions.push({
    label: `${i}月`,
    value: i,
  });
}
for (let i = 1; i < 8; i++) {
  weekDayOptions.push({
    label: `周${map[i as keyof typeof map]}`,
    value: i,
  });
}

// const Renderer: ItemRenderer<OptionItem> = (option, { handleClick, modifiers }) => {
//   return <MenuItem active={modifiers.active} label={option.label.toString()} onClick={handleClick} text={option.value}></MenuItem>;
// };

// const CommonSelect = () => {
//   return (
//     <MultiSelect tagRenderer={(option) => option.label} items={weekDayOptions} itemRenderer={Renderer} onItemSelect={noop}></MultiSelect>
//   );
// };
const Card: React.FC<React.HTMLProps<HTMLDivElement>> = ({ className, children, ...rest }) => {
  return (
    <div className={classNames("bg-gray-50 flex-grow h-12 rounded border border-solid border-gray-100", className)} {...rest}>
      {children}
    </div>
  );
};
const Settings: React.FC<React.HTMLProps<HTMLDivElement>> = () => {
  const [value, setValue] = useState("input");
  const [checked, setChecked] = useState(false);
  return (
    <div className="p-5 w-96 max-h-[700px] overflow-y-auto">
      <p className="text-lg font-medium">触发设置</p>
      <div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>crontab触发</span>
          <select
            name="crontab"
            id=""
            className="text-blue-400"
            onChange={(e) => {
              setValue(e.target.value);
            }}
            value={value}
          >
            <option value="input">表达式输入</option>
            <option value="select">控件输入</option>
          </select>
        </div>
        {value === "select" ? (
          <>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs w-12">分钟</span>
              <div className="ml-4 bg-gray-50 flex-grow h-12 rounded border border-solid border-gray-100"></div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs w-12">小时</span>
              <div className="ml-4 bg-gray-50 flex-grow h-12 rounded border border-solid border-gray-100"></div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs w-12">天/月</span>
              <div className="ml-4 bg-gray-50 flex-grow h-12 rounded border border-solid border-gray-100"></div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs w-12">月份</span>
              <div className="ml-4 bg-gray-50 flex-grow h-12 rounded border border-solid border-gray-100"></div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs w-12">星期/周</span>
              <div className="ml-4 bg-gray-50 flex-grow h-12 rounded border border-solid border-gray-100"></div>
            </div>
          </>
        ) : (
          <Card className="mt-2" />
        )}
      </div>
      <div>
        <p className="mt-4 text-sm">
          <span>key触发</span>
        </p>
        <Card className="mt-2" />
      </div>
      <Divider className="my-8" />
      <div>
        <p className="text-lg font-medium">运行策略</p>
        <p className="mt-4 text-sm">
          <span>超时设置（秒）</span>
        </p>
        <Card className="mt-2" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mt-4 text-sm">
              <span>重试次数</span>
              <Card className="mt-2" />
            </div>
          </div>
          <div>
            <div className="mt-4 text-sm">
              <span>重试间隔（秒）</span>
              <Card className="mt-2" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm">允许在任务运行时开启新的任务</span>
          <Switch
            checked={checked}
            className="mb-0"
            onChange={(e) => {
              setChecked(e.currentTarget.checked);
            }}
          />
        </div>
      </div>
      <ContainButton className="mt-4 w-40 h-12 flex mx-auto justify-center items-center">保存</ContainButton>
    </div>
  );
};

export default Settings;
