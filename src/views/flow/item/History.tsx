import { FlowRunningState } from "@/api/flow";
import { Nullable, RunningEnum, runningStateTexts } from "@/common";
import { Button, Icon, Popover2, Position, RunningState, ToastPlugin, Tooltip2 } from "@/components";
import { Loading } from "@/components/Loading";
import { useClickOutside } from "@/hooks";
import classNames from "classnames";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { StoreContext } from "./store";

function getStateDescription(history: FlowRunningState) {
  switch (history.status) {
    case RunningEnum.running:
      return `${history.start_time}开始`;
    case RunningEnum.queue:
    case RunningEnum.created:
      return "等待运行";
    case RunningEnum.userCancel:
      return `${history.cancel_user_name} 取消了运行`;
    case RunningEnum.failed:
      return history.error_msg || "暂无报错信息";
  }
  return `${history.end_time || "-"} 结束`;
  // return `${history.start_time} 至 ${history.end_time}`;
}
const Content = observer<React.HTMLProps<HTMLDivElement>, HTMLDivElement>(
  ({ children, className, ...rest }, ref) => {
    const store = useContext(StoreContext);
    const [index, setIndex] = useState(0);
    const [fetching, setFetching] = useState(false);

    const switchHistory = useCallback(
      async (item) => {
        store.setCurrentHistory(item);
      },
      [store],
    );
    useEffect(() => {
      return reaction(
        () => store.currentHistory,
        async (history) => {
          const i = store.runningHistory.findIndex((item) => item.id === history?.id);
          setFetching(true);
          if (history) {
            await store.switchHistory(history.flow_id);
          }
          setIndex(i);
          setFetching(false);
        },
        {
          fireImmediately: true,
        },
      );
    }, [store, switchHistory]);
    return (
      <div ref={ref} className={classNames(className, "py-2 w-96 max-h-[600px] overflow-y-auto relative")} {...rest}>
        <p className="mb-2 pb-2 font-medium px-4 text-center border-b border-solid border-gray-100">选择一个历史记录</p>
        {store.runningHistory.map((item, i) => (
          <div
            key={item.id}
            className={classNames("flex items-center py-3 px-4 hover:bg-gray-50 cursor-default", {
              "border-b border-solid border-gray-100": i !== store.runningHistory.length - 1,
            })}
            onClick={async () => {
              if (item === store.currentHistory) return;
              await switchHistory(item);
              window.history.pushState("", "", `?version=${item.id}`);
              ToastPlugin({
                message: "已切换",
              });
            }}
          >
            <div className="flex-grow mr-4 text-sm overflow-hidden ">
              <div className="font-medium">
                <RunningState status={item.status} />
                <span className="ml-2">{runningStateTexts[item.status]}</span>
                {i === 0 && (
                  <span className="inline-block px-2 py-0.5 rounded-full border border-solid text-xs ml-2 text-gray-400">
                    最近一次运行
                  </span>
                )}
              </div>
              <p
                className="mt-1 text-gray-400 overflow-hidden overflow-ellipsis whitespace-nowrap text-xs"
                title={getStateDescription(item)}
              >
                {/* <span className="text-xs w-4 h-4 flex items-center justify-center transform scale-80 bg-green-400 text-white rounded-sm">
                  起
                </span> */}
                {getStateDescription(item)}
              </p>
            </div>
            <Icon icon="tick" className={classNames(index === i ? "visible" : "invisible")} />
          </div>
        ))}
        <Loading className={classNames("absolute z-10", fetching ? "" : "invisible")} />
      </div>
    );
  },
  {
    forwardRef: true,
  },
);

const History = observer(() => {
  const store = useContext(StoreContext);
  const [visible, setVisible] = useState(false);
  const ref = useRef<Nullable<HTMLDivElement>>(null);

  useEffect(() => {
    const onChange = () => {
      store.updateCurrentHistory();
      setVisible(true);
    };
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
    };
  }, [store]);
  const show = useCallback(() => {
    setVisible(true);
    store.request.getRunningHistory();
  }, [store]);
  const hide = useCallback(() => {
    setVisible(false);
  }, []);
  const { run, destroy } = useClickOutside(ref, hide, true);
  if (store.detail?.is_draft || store.runningHistory.length === 0) return null;

  return (
    <Popover2
      interactionKind="click"
      usePortal
      content={<Content ref={ref} />}
      position={Position.BOTTOM_RIGHT}
      isOpen={visible}
      onOpened={run}
      onClosed={destroy}
    >
      <Tooltip2 content="切换运行记录" placement="bottom">
        <div className="flex items-center">
          <RunningState status={store.currentHistory?.status || RunningEnum.success} disableTooltip />
          <Button className="ml-1" minimal rightIcon="caret-down" onClick={show}>
            {runningStateTexts[store.currentHistory?.status || RunningEnum.success]}
          </Button>
        </div>
      </Tooltip2>
    </Popover2>
  );
});

export default History;
