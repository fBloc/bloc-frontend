import { SelectOption } from "@/api/bloc";
import { FlowDetailT, getDetail, TruthySimpleValue, updateDetail, ValueType } from "@/api/flow";
import { Noop, noop, Nullable } from "@/common";
import {
  Button,
  ContainButton,
  Divider,
  EnhancedNumberInput,
  InputGroup,
  MenuItem,
  NativeSelect,
  NumericInput,
  Popover2,
  Position,
  Switch,
  ToastPlugin,
  Tooltip2,
} from "@/components";
import { ItemRenderer, Select, MultiSelect, MultiSelectProps } from "@blueprintjs/select";
import classNames from "classnames";
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import { CommonSelect, MultiSelectT } from "./Editor/Select";
import useRequest from "@umijs/use-request";
import { Loading } from "@/components/Loading";
import { handleBooleanChange, handleStringChange } from "@/utils";
import { useClickOutside } from "@/hooks";
import { observer } from "mobx-react-lite";
import { StoreContext } from "./store";
interface OptionItem {
  label: string | number;
  value: string | number;
}
const ALL_SELECTED = {
  label: "全选",
  value: "all",
};
const minuteOptions: OptionItem[] = [
  {
    ...ALL_SELECTED,
  },
];
const hourOptions: OptionItem[] = [
  {
    ...ALL_SELECTED,
  },
];
const monthDateOptions: OptionItem[] = [
  {
    ...ALL_SELECTED,
  },
];
const monthOptions: OptionItem[] = [
  {
    ...ALL_SELECTED,
  },
];
const weekDayOptions: OptionItem[] = [
  {
    ...ALL_SELECTED,
  },
];
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
    label: `${i}分`,
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

const CrontabItemInput: React.FC<MultiSelectT> = ({ ...rest }) => {
  const Clear =
    rest.value.length > 0 ? (
      <Tooltip2 content="清除" placement="top">
        <Button
          icon="cross"
          minimal={true}
          onClick={() => {
            rest.onChange?.([]);
          }}
        />
      </Tooltip2>
    ) : undefined;
  return (
    <CommonSelect
      {...rest}
      tagRenderer={(node) => {
        const index = rest.value.findIndex((v) => v === node.value);
        if (index > 1) return null;
        if (index === 1) return ` + ${rest.value.length - 1}`;
        return node.label;
      }}
      fill={true}
      placeholder="请选择"
      tagInputProps={{
        rightElement: Clear,
        tagProps: (tag, index) => {
          return index === 0
            ? {
                minimal: true,
                onRemove: (e, tag) => {
                  rest.onChange?.(rest.value.filter((item, i) => i !== index));
                },
              }
            : {
                minimal: true,
                onRemove: undefined,
              };
        },
        inputProps: {
          disabled: true,
          readOnly: true,
          className: "cursor-default",
          ...rest.tagInputProps?.inputProps,
        },
        ...rest.tagInputProps,
      }}
      popoverProps={{
        usePortal: false,
        ...rest.popoverProps,
      }}
    />
  );
};

const SettingsPanel = observer<React.HTMLProps<HTMLDivElement> & { originId: string; onClose: Noop }, HTMLDivElement>(
  ({ originId, onClose }, ref) => {
    const store = useContext(StoreContext);

    const [value, setValue] = useState("input");
    const [checked, setChecked] = useState(false);
    const [minutes, setMinutes] = useState<TruthySimpleValue[]>([]);
    const [hours, setHours] = useState<TruthySimpleValue[]>([]);
    const [dayOfMonth, setDayOfMonth] = useState<TruthySimpleValue[]>([]);
    const [months, setMonths] = useState<TruthySimpleValue[]>([]);
    const [dayOfWeek, setDayOfWeek] = useState<TruthySimpleValue[]>([]);
    const [timeOut, setTimeout] = useState<number | undefined>();
    const [retryTimes, setRetryTimes] = useState<number | undefined>();
    const [retryGap, setRetryGap] = useState<number | undefined>();
    const [trigger, setTrigger] = useState("");
    const [crontab, setCrontab] = useState("");
    const [detail, setDetail] = useState<Nullable<FlowDetailT>>(null);
    const { error, data, loading } = useRequest(getDetail, {
      defaultParams: [originId],
    });
    const { run: saveChanges, loading: saving } = useRequest(updateDetail, {
      manual: true,
    });
    useLayoutEffect(() => {
      if (data?.data && data.isValid) {
        const { retry_amount, retry_interval_in_second, timeout_in_seconds, crontab, trigger_key, pub_while_running } =
          data.data;
        setTimeout(timeout_in_seconds || undefined);
        setRetryTimes(retry_amount || undefined);
        setRetryGap(retry_interval_in_second || undefined);
        setTrigger(trigger_key || "");
        setCrontab(crontab || "");
        setChecked(pub_while_running);
        setDetail(data?.data);
      }
    }, [data]);

    return (
      <div className="p-5 w-80 max-h-[600px] overflow-y-auto" ref={ref}>
        <p className="text-lg font-medium">触发设置</p>
        <div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>crontab触发</span>
            <select
              name="crontab"
              disabled={saving || loading}
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
                <span className="text-xs w-12 mr-4">分钟</span>
                <CrontabItemInput
                  value={minutes}
                  onChange={setMinutes}
                  items={minuteOptions}
                  disabled={saving || loading}
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs w-12 mr-4">小时</span>
                <CrontabItemInput value={hours} onChange={setHours} items={hourOptions} disabled={saving || loading} />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs w-12 mr-4">天/月</span>
                <CrontabItemInput
                  value={dayOfMonth}
                  onChange={setDayOfMonth}
                  items={monthDateOptions}
                  disabled={saving || loading}
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs w-12 mr-4">月份</span>
                <CrontabItemInput
                  value={months}
                  onChange={setMonths}
                  items={monthOptions}
                  disabled={saving || loading}
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs w-12 mr-4 whitespace-nowrap">星期/周</span>
                <CrontabItemInput
                  value={dayOfWeek}
                  onChange={setDayOfWeek}
                  items={weekDayOptions}
                  disabled={saving || loading}
                />
              </div>
            </>
          ) : (
            <InputGroup
              className="mt-2"
              placeholder="输入crontab表达式"
              type="text"
              value={crontab}
              onChange={handleStringChange(setCrontab)}
              disabled={saving || loading}
            />
          )}
        </div>
        <div>
          <p className="mt-4 text-sm">
            <span>key触发</span>
          </p>
          <InputGroup
            className="mt-2"
            placeholder="输入key"
            type="text"
            value={trigger}
            onChange={handleStringChange(setTrigger)}
            disabled={saving || loading}
          />
        </div>
        <Divider className="my-8" />
        <div>
          <p className="text-lg font-medium">运行策略</p>
          <p className="mt-4 text-sm">
            <span>超时设置（秒）</span>
          </p>
          <EnhancedNumberInput
            className="mt-2"
            fill
            defaultValue=""
            value={timeOut}
            onValueChange={setTimeout}
            stepSize={10}
            min={0}
            disabled={saving || loading}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mt-4 text-sm">
                <span>重试次数</span>
                <EnhancedNumberInput
                  className="mt-2"
                  fill
                  defaultValue=""
                  value={retryTimes}
                  onValueChange={setRetryTimes}
                  stepSize={10}
                  min={0}
                  disabled={saving || loading}
                />
              </div>
            </div>
            <div>
              <div className="mt-4 text-sm">
                <span>重试间隔（秒）</span>
                <EnhancedNumberInput
                  className="mt-2"
                  fill
                  defaultValue=""
                  value={retryGap}
                  onValueChange={setRetryGap}
                  stepSize={10}
                  min={0}
                  disabled={saving || loading}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">允许在任务运行时开启新的任务</span>
            <Switch
              checked={checked}
              className="mb-0"
              onChange={handleBooleanChange(setChecked)}
              disabled={saving || loading}
            />
          </div>
        </div>
        <ContainButton
          className="mt-8 w-40 h-10 flex mx-auto justify-center items-center"
          loading={saving}
          onClick={async () => {
            const { isValid } = await saveChanges({
              id: detail?.id || "",
              crontab: crontab,
              timeout_in_seconds: timeOut,
              retry_amount: retryTimes,
              retry_interval_in_second: retryGap,
              trigger_key: trigger,
              pub_while_running: checked,
            });
            if (isValid) {
              store.patchDetail("pub_while_running", checked);
              ToastPlugin({
                intent: "success",
                message: "保存成功",
              });
              onClose();
            }
          }}
        >
          保存
        </ContainButton>
        <div
          className={classNames("absolute left-0 top-0 w-full h-full bg-white bg-opacity-40 backdrop-blur-sm rounded", {
            invisible: !loading,
          })}
        ></div>
        <Loading className={classNames("absolute", { invisible: !loading })} />
      </div>
    );
  },
  {
    forwardRef: true,
  },
);

const Settings = observer(() => {
  const store = useContext(StoreContext);
  const ref = useRef<Nullable<HTMLDivElement>>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);
  const show = useCallback((e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setSettingsOpen(true);
  }, []);
  const close = useCallback(() => {
    setSettingsOpen(false);
  }, []);
  const { run, destroy } = useClickOutside(ref, close, true);
  if (!store.canUpdateSettings) return null;
  return (
    <Popover2
      interactionKind="click"
      usePortal
      onOpened={run}
      onClosed={destroy}
      isOpen={settingsOpen}
      content={<SettingsPanel originId={store.originId} onClose={closeSettings} ref={ref} />}
      position={Position.BOTTOM_RIGHT}
    >
      <Tooltip2 content="运行设置" placement="bottom-end" className="mx-4">
        <Button icon="cog" minimal onClick={show} />
      </Tooltip2>
    </Popover2>
  );
});
export default Settings;
