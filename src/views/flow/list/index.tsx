import React, { useMemo, useEffect, useCallback, useContext, useState } from "react";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { useHistory } from "react-router-dom";
import { RouterContext } from "@/router";
import { Tab, Spinner, Icon, Tooltip2, spinnerPlugin, SearchInput } from "@/components";
import { Loading } from "@/components/Loading";
import { RunningEnum, DetailType, tabs, runningStateTexts } from "@/common";
import { ListStore } from "./store/list";
import { FlowItemStore as Store, StoreProvider } from "../item/store";
import HeaderBar from "./HeaderBar";
import Board from "../board";
import { isLaunchedFlow } from "@/api/flow";
import { handleStringChange } from "@/utils";

const classes: Record<RunningEnum, string> = {
  [RunningEnum.created]: "bg-yellow-50 text-yellow-400",
  [RunningEnum.queue]: "bg-yellow-50 text-yellow-400",
  [RunningEnum.running]: "bg-yellow-50 text-yellow-400",
  [RunningEnum.success]: "bg-green-50 text-green-400",
  [RunningEnum.systemCancel]: "bg-red-50 text-red-400",
  [RunningEnum.userCancel]: "bg-red-50 text-red-400",
  [RunningEnum.failed]: "bg-red-50 text-red-400",
};

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
  if (store.currentList.length === 0) {
    return <div className="py-20 text-center text-gray-400">暂无数据</div>;
  }
  return (
    <div className="flex-grow overflow-auto">
      {store.currentList.map((item, index) => (
        <div
          key={item.id}
          className={classNames("py-5 border-b border-solid border-gray-100 px-4", {
            "bg-gray-50": index === store.index,
          })}
          onClick={() => {
            store.setIndex(index);
          }}
        >
          {isLaunchedFlow(item) ? (
            <span
              className={classNames(
                "px-2 py-1 rounded-full text-xs  font-medium",
                classNames(classes[item.latest_run.status]),
              )}
            >
              {runningStateTexts[item.latest_run.status] || "从未运行"}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-500 font-medium">草稿</span>
          )}
          <p className="mt-4">{item.name || "未命名"}</p>
        </div>
      ))}
    </div>
  );
});

const SelectFlow = (
  <div className="h-full flex justify-center items-center">
    <p className="text-gray-500 text-sm">选择一个Flow进行查看</p>
  </div>
);

const PreviewBoard: React.FC<{ originId: string; detailType: DetailType }> = observer(({ originId, detailType }) => {
  const store = useMemo(() => new Store(), []);
  const { request } = store;
  useEffect(() => {
    return () => {
      store.onDestroy();
    };
  }, [store]);
  return (
    <StoreProvider value={store}>
      <div className="flex-grow relative bg-gray-100">
        {originId ? (
          <>
            <HeaderBar />
            <Board originId={originId} store={store} detailType={detailType} />
          </>
        ) : (
          SelectFlow
        )}
        {request.fetching && <Loading className="absolute" />}
      </div>
    </StoreProvider>
  );
});

const ListPage = observer(() => {
  const store = useMemo(() => new ListStore(), []);
  const reload = useContext(RouterContext);
  const history = useHistory();
  const [searchKey, setSearchKey] = useState("");
  const createDraft = useCallback(async () => {
    spinnerPlugin.show({
      message: "正在创建...",
    });
    const { data, isValid } = await store.createDraft();
    spinnerPlugin.hide();
    if (isValid) {
      if (data?.origin_id) {
        history.push(`/flow/${data.origin_id}?type=edit`);
        reload.setKey();
      }
    }
  }, [store, reload, history]);
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
              store.switchTab(value as DetailType);
            }}
          />
          <div className="flex items-center">
            <form
              action=""
              onSubmit={(e) => {
                e.preventDefault();
                store.filterList(searchKey);
              }}
            >
              <SearchInput value={searchKey} onChange={handleStringChange(setSearchKey)} />
            </form>
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
      <PreviewBoard originId={store.currentFlow?.origin_id} detailType={store.tab} />
    </div>
  );
});

export default ListPage;
