import React, { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";

import {
  Icon,
  InputGroup,
  Button,
  Menu,
  MenuItem,
  MenuDivider,
  Popover2,
  LogoRoute,
  RunningState,
  List,
  Colors,
} from "@/components";
import { DetailType } from "@/common";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { ListContext, ListStore } from "./store/list";
import { reaction } from "mobx";
import { handleStringChange, stopPropagation } from "@/utils";
import { useClickOutside } from "@/hooks";
import { AppStoreContext } from "@/store";

const tabs = [
  {
    value: DetailType.launched,
    label: "已发布",
  },
  {
    value: DetailType.draft,
    label: "未发布",
  },
];

const Header = observer(() => {
  const store = useContext(ListContext);
  const appStore = useContext(AppStoreContext);

  const { tab } = store;
  const switchTab = useCallback(
    (tab: DetailType) => {
      store.switchTab(tab);
    },
    [store],
  );
  return (
    <header className="px-4 flex items-center justify-between border-b border-solid border-gray-200 bg-gray-100 h-16 flex-shrink-0">
      <div className="flex items-center flex-1">
        <LogoRoute to="/" />
        <span
          className="ml-3 inline-flex px-2 items-center bg-gray-700 rounded-full text-white"
          style={{
            height: 22,
          }}
        >
          <Icon icon="cube" iconSize={12} className="mr-2" />
          <span className="font-medium text-xs">素材</span>
        </span>
      </div>
      <div className="text-center flex-1 h-full">
        <ul className="inline-flex h-full">
          {tabs.map(({ value, label }) => (
            <li
              key={value}
              onClick={() => {
                switchTab(value);
              }}
              className={`h-full px-8 flex items-center font-medium cursor-pointer ${
                tab === value ? "absolute-border-b" : "text-gray-400"
              }`}
              style={{
                color: tab === value ? Colors.COBALT1 : "",
              }}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
      <span className="flex-1 text-right">
        <Popover2
          interactionKind="click"
          placement="bottom-end"
          content={
            <Menu>
              <MenuItem
                text="退出"
                onClick={() => {
                  appStore.logout();
                }}
              />
            </Menu>
          }
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-400 text-white font-medium cursor-pointer">
            B
          </span>
        </Popover2>
      </span>
    </header>
  );
});

const ItemMenu: React.FC<{
  store: ListStore;
  index: number;
}> = observer(({ store, index }) => {
  const history = useHistory();
  const ref = useRef<HTMLDivElement | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const list = store.currentList;
  useClickOutside(ref, () => {
    store.setIndex(-1);
    setConfirmed(false);
  });
  return (
    <Popover2
      content={
        <div ref={ref}>
          <Menu onClick={stopPropagation}>
            <MenuItem
              icon="edit"
              text="修改"
              onClick={() => {
                history.push(`/flow/${list[index].origin_id}`);
              }}
            />
            {store.tab === DetailType.draft && (
              <>
                <MenuDivider />
                {confirmed ? (
                  <MenuItem
                    icon="tick"
                    text="确认删除"
                    intent="danger"
                    onClick={() => {
                      store.delete(list[index].origin_id);
                    }}
                  />
                ) : (
                  <MenuItem
                    icon="trash"
                    text="删除"
                    intent="danger"
                    onClick={() => {
                      setConfirmed(true);
                    }}
                  />
                )}
              </>
            )}
          </Menu>
        </div>
      }
      placement="bottom"
      isOpen={store.index === index}
      modifiers={{
        arrow: {
          enabled: false,
        },
      }}
    >
      <Button
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          store.setIndex(index);
        }}
        icon="more"
        minimal={true}
        className="invisible group-hover:visible"
      />
    </Popover2>
  );
});
const ListView = observer(() => {
  const store = useMemo(() => new ListStore(), []);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [keyword, setKeyword] = useState("");

  const createDraft = useCallback(async () => {
    const res = await store.createDraft();
    setLoading(true);
    if (res && res.data && res.isValid) {
      const { origin_id } = res.data;
      setLoading(false);
      history.push(`/flow/${origin_id}`);
    } else {
      setLoading(false);
    }
  }, [history, store]);
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
  return (
    <ListContext.Provider value={store}>
      <Header />
      <div className="max-w-6xl mx-auto mt-4">
        {store.data.length > 0 && (
          <div className="flex justify-between">
            <form
              action=""
              onSubmit={(e) => {
                e.preventDefault();
                store.filterList(keyword);
              }}
            >
              <InputGroup
                value={keyword}
                className="items-center flex"
                style={{
                  width: 200,
                  borderRadius: "0.75rem",
                  height: 40,
                }}
                onChange={handleStringChange(setKeyword)}
                placeholder="搜索"
              />
            </form>
            <Button
              icon="plus"
              intent="primary"
              className="ml-2"
              style={{
                width: 40,
                height: 40,
                borderRadius: "0.75rem",
              }}
              onClick={createDraft}
              loading={loading}
            />
          </div>
        )}
        <List
          className="grid grid-cols-4 gap-2 mt-6"
          emptyProps={{
            className: "mt-20",
          }}
        >
          {store.currentList.map((item, index) => (
            <div
              className="bg-white border border-solid border-gray-200 rounded-xl group hover:border-blue-300 transition-all"
              key={item.id}
            >
              <Link
                to={`/flow/${item.origin_id}`}
                className="p-3 flex items-center text-current hover:text-current hover:no-underline"
              >
                <div className="flex-grow overflow-hidden flex items-center">
                  {/* <RunningState status={item.s} /> */}
                  <span className="text-ellipsis" title={item.name || "未命名"}>
                    {item.name || "未命名"}
                  </span>
                </div>
                <ItemMenu index={index} store={store} />
              </Link>
            </div>
          ))}
        </List>
      </div>
    </ListContext.Provider>
  );
});

export default ListView;
