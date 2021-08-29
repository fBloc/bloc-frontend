import React, { useMemo, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { ListStore } from "./store/list";
import { reaction } from "mobx";
import { Tab, Spinner, Icon, Tooltip2, spinnerPlugin, SearchInput } from "@/components";
import classNames from "classnames";
import Board from "./Board";
import { useHistory } from "react-router-dom";
import { TabEnums, tabs } from "@/common";

const Items: React.FC<{ store: ListStore }> = observer(({ store }) => {
  useEffect(() => {
    return reaction(
      () => store.tab,
      async () => {
        await store.fetchList();
        store.setCurrentList();
      },
      {
        fireImmediately: true,
      },
    );
  }, [store]);

  if (store.loading) {
    return <Spinner className="mt-10" />;
  }
  return (
    <div className="flex-grow overflow-auto">
      {store.currentList.map((item, index) => (
        <div
          key={item.id}
          className={classNames("py-5 border-b border-solid border-gray-100 px-4", {
            "bg-gray-100": index === store.index,
          })}
          onClick={() => {
            store.setIndex(index);
          }}
        >
          {item.latest_run ? (
            <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-400 font-medium">运行中</span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-500 font-medium">
              {store.tab === TabEnums.draft ? "草稿" : "从未运行"}
            </span>
          )}
          <p className="mt-4">{item.name}</p>
        </div>
      ))}
    </div>
  );
});
const List = observer(() => {
  const store = useMemo(() => new ListStore(), []);
  const history = useHistory();
  const createDraft = useCallback(async () => {
    spinnerPlugin.show({
      message: "正在创建...",
    });
    const { data, isValid } = await store.createDraft();
    spinnerPlugin.hide();
    if (isValid) {
      if (data?.origin_id) {
        history.push(`/flow/${data.origin_id}`);
      }
    }
  }, [history, store]);
  return (
    <div className="flex-grow flex items-stretch">
      <div className="list w-72 border-r border-solid border-gray-100 h-screen flex flex-col flex-shrink-0">
        <div
          className="pt-4 mb-2 pb-4 px-4"
          style={{
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Tab
            className="mb-4"
            value={store.tab}
            options={tabs}
            onValueChange={(value) => {
              store.switchTab(value as TabEnums);
            }}
          />
          <div className="flex items-center">
            <SearchInput />
            <Tooltip2 content="创建新的flow" placement="bottom">
              <span
                className="cursor-pointer rounded-full w-10 h-10 bg-gray-50 border border-solid border-gray-200 inline-flex justify-center items-center"
                onClick={createDraft}
              >
                <Icon icon="plus" size={16} />
              </span>
            </Tooltip2>
          </div>
        </div>
        <Items store={store} />
      </div>
      <div className="flex-grow relative bg-gray-100">
        <Board originId={store.currentFlow?.origin_id} />
      </div>
    </div>
  );
});

export default List;
