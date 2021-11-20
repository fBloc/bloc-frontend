import React, { memo, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { autorun } from "mobx";
import { Tabs, Button, Menu, MenuItem, MenuDivider, Colors, Icon, Popover2, LogoRoute, List } from "@/components";
import { ListContext, ListStore } from "./store/list";
import { DetailType } from "@/common";
import { Arrangement } from "@/api/arrangement";
const ArrangementItemContainer: React.FC<React.HTMLProps<HTMLDivElement>> = memo(
  ({ className, children, style, ...rest }) => {
    return (
      <div
        {...rest}
        className={`ml-4 mb-4 2xl:w-56 w-1/6 bg-white rounded border border-solid border-gray-200 flex flex-col group hover:border-blue-300 transition-all ${className}`}
        style={{
          height: "280px",
          ...style,
        }}
      >
        {children}
      </div>
    );
  },
);
const ArrangementSkeleton = memo(() => {
  return (
    <div className="flex flex-wrap -ml-4">
      {Array.from("abcdefghjklm").map((item) => (
        <ArrangementItemContainer key={item} className="bp3-skeleton"></ArrangementItemContainer>
      ))}
    </div>
  );
});
const ArrangementItem: React.FC<{ detail: Arrangement; menu: React.ReactElement }> = memo(({ detail, menu }) => {
  return (
    <ArrangementItemContainer>
      <Link to={`/arrangement/${detail.origin_id}`} className="flex-grow text-current hover:text-current p-3">
        {/* <Spinner intent="warning" size={16} /> */}
      </Link>
      <div className="px-3 pt-3 pb-2 border-t border-solid border-gray-100">
        <p className="overflow-ellipsis overflow-hidden whitespace-nowrap font-medium">{detail.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center justify-center">
            <span
              className="inline-flex w-3 h-3 rounded-full items-center justify-center"
              style={{
                backgroundColor: Colors.RED4,
              }}
            >
              <Icon icon="cross" iconSize={8} color="#fff" />
            </span>
            <span className="ml-1 text-xs font-medium text-gray-400">运行失败</span>
          </span>
          <Popover2
            content={menu}
            placement="right-start"
            modifiers={{
              arrow: {
                enabled: false,
              },
            }}
          >
            <Button icon="more" minimal={true} className="invisible group-hover:visible"></Button>
          </Popover2>
        </div>
      </div>
    </ArrangementItemContainer>
  );
});
const OnlineItems = observer(() => {
  const store = useContext(ListContext);
  useEffect(() => {
    store.getList();
  }, [store]);
  const menu = (
    <Menu className="shadow">
      <MenuItem icon="stop" text="终止任务" shouldDismissPopover={false} />
      <MenuItem icon="edit" text="修改" shouldDismissPopover={false} />
      <MenuDivider />
      <MenuItem icon="trash" text="删除" intent="danger" />
    </Menu>
  );
  return (
    <List
      className="flex flex-wrap -ml-4"
      loading={store.loading}
      skeleton={<ArrangementSkeleton />}
      emptyProps={{
        className: "mt-20",
      }}
    >
      {store.list.map((item) => (
        <ArrangementItem detail={item} menu={menu} key={item.id} />
      ))}
    </List>
  );
});
const DraftItems = observer(() => {
  const store = useContext(ListContext);
  useEffect(() => {
    store.getList();
  }, [store]);
  const menu = (
    <Menu className="shadow">
      <MenuItem icon="edit" text="修改" />
      <MenuDivider />
      <MenuItem icon="trash" text="删除" intent="danger" />
    </Menu>
  );
  return (
    <List
      className="flex flex-wrap -ml-4"
      loading={store.loading}
      skeleton={<ArrangementSkeleton />}
      emptyProps={{
        className: "mt-20",
      }}
    >
      {store.draftList.map((item) => (
        <ArrangementItem detail={item} menu={menu} key={item.id} />
      ))}
    </List>
  );
});

const Main = observer(() => {
  const store = useMemo(() => new ListStore(), []);
  useEffect(() => {
    const disposer = autorun(() => {
      store.tab === DetailType.launched ? store.getList() : store.getDraftList();
    });
    return () => {
      disposer();
    };
  }, [store]);
  return (
    <ListContext.Provider value={store}>
      <div className="flex flex-col h-screen">
        <header className="border-b border-solid border-gray-200 bg-gray-100 h-16 flex items-center px-4 flex-shrink-0">
          <LogoRoute to="/" />
        </header>
        <div className="flex flex-grow items-stretch overflow-hidden">
          <div className="w-60 p-4 flex-shrink-0 text-center">
            <Button className="w-3/4 mx-auto" icon="help">
              使用说明
            </Button>
            <br />
            <Link to="/flow" target="_blank" className="mt-4 w-3/4 block mx-auto">
              <Button className="w-full mx-auto flex items-center" icon="cube">
                素材管理
              </Button>
            </Link>
          </div>
          <main className="flex-grow p-4 overflow-auto h-full">
            <Tabs
              selectedTabId={store.tab}
              onChange={(tab) => {
                store.switchTab(tab as DetailType);
              }}
            >
              {/* <Tab panel={<OnlineItems />} id={DetailType.launched} title="已发布" /> */}
              {/* <Tab id={DetailType.draft} title="未发布" /> */}
            </Tabs>
          </main>
        </div>
      </div>
    </ListContext.Provider>
  );
});

export default Main;
