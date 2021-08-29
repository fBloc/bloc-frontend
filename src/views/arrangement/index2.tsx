import React, { memo, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { autorun } from "mobx";
import {
  Button,
  Menu,
  MenuItem,
  MenuDivider,
  Colors,
  Icon,
  Popover2,
  List,
  spinnerPlugin,
  Tab,
  SearchInput,
  Tooltip2,
} from "@/components";
import { ListContext, ListStore } from "./store/list";
import { TabEnums, tabs } from "@/common";
import { Arrangement } from "@/api/arrangement";

const ArrangementItemContainer: React.FC<React.HTMLProps<HTMLDivElement>> = memo(
  ({ className, children, style, ...rest }) => {
    return (
      <div
        {...rest}
        className={`bg-gray-50 rounded-lg group hover:border-blue-300 transition-all hover:bg-gray-100 ${className}`}
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
      <Link
        to={`/arrangement/${detail.origin_id}`}
        className="block flex-grow text-current hover:text-current p-3 px-3 py-2 hover:no-underline"
      >
        <div className="flex items-center justify-between ">
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
        <p className="overflow-ellipsis overflow-hidden whitespace-nowrap font-medium">{detail.name}</p>
      </Link>
    </ArrangementItemContainer>
  );
});
const OnlineItems = observer(() => {
  const store = useContext(ListContext);
  useEffect(() => {
    async function main() {
      spinnerPlugin.show();
      await store.getList();
      spinnerPlugin.hide();
    }
    main();
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
    <div className="mt-4 grid gap-3 grid-cols-3">
      {store.list.map((item) => (
        <ArrangementItem detail={item} menu={menu} key={item.id} />
      ))}
    </div>
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
      className="grid grid-cols-4 gap-2"
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
      store.tab === TabEnums.launched ? store.getList() : store.getDraftList();
    });
    return () => {
      disposer();
    };
  }, [store]);
  return (
    <ListContext.Provider value={store}>
      <div className="flex-grow p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <Tab
            className="w-64"
            options={tabs}
            value={store.tab}
            onValueChange={(value) => {
              store.switchTab(value as TabEnums);
            }}
          />
          <div className="flex items-center">
            <SearchInput />
            <Tooltip2 content="创建新的编排" placement="bottom">
              <span className="cursor-pointer rounded-full w-10 h-10 bg-gray-50 border border-solid border-gray-200 inline-flex justify-center items-center">
                <Icon icon="plus" size={16} />
              </span>
            </Tooltip2>
          </div>
        </div>
        <OnlineItems />
      </div>
      <div className="flex-shrink-0 p-4 2xl:w-96 w-80">
        <p className="text-xl font-medium">什么是编排？</p>
        <p className="mt-2 text-sm text-gray-600">
          什么是编排？什么是编排？什么是编排？什么是编排？什么是编排？么是编排？什么是编排？什么是编排？？么是编排？什么是编排？什么是编排？？么是编排？什么是编排？什么是编排？
        </p>
      </div>
    </ListContext.Provider>
  );
});

export default Main;
