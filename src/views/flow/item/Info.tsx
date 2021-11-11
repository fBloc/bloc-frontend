import React, { useContext, useCallback, memo } from "react";
import { StoreContext } from "./store";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { List } from "@/components";
import { Drawer } from "@/components";
import { FunctionItem } from "@/api/bloc";
import { ReadableValue } from "./Setter";
import { DrawerProps, Icon, Tab, Tabs } from "@blueprintjs/core";
import { BasicBloc } from "@/fabric/objects";

const InputParams: React.FC<{ blocFunction: FunctionItem; blocNode: BasicBloc }> = memo(
  ({ blocFunction, blocNode }) => {
    const getAtom = useCallback(
      (paramIndex: number, atomIndex: number) => {
        const paramIptLen = blocNode.paramIpts?.length || 0;
        const atomLen = blocNode.paramIpts?.[paramIndex]?.length || 0;
        if (paramIptLen > paramIndex && atomLen > atomIndex) {
          return blocNode.paramIpts?.[paramIndex]?.[atomIndex];
        }
        return undefined;
      },
      [blocNode.paramIpts],
    );
    return (
      <List>
        {blocFunction.ipt.map((item, index) => (
          <div key={item.key} className="mb-8">
            <div className="flex items-center">
              <span className="w-8 h-8 inline-flex justify-center items-center bloc-card rounded-full">
                {index + 1}
              </span>
              <div className="ml-2">
                <p
                  className="font-monaco text-xs text-gray-400"
                  style={{
                    height: "20px",
                  }}
                >
                  {item.key}
                </p>
                <p className="mt-1 text-sm">{item.display || "暂无描述"}</p>
              </div>
            </div>
            <div className="ml-10">
              <List className="mt-4">
                {item.components.map((atom, atomIndex) => (
                  <div
                    key={atomIndex}
                    className={classNames("p-3 rounded mt-2 border", {
                      "border-dashed border-gray-200 bg-white":
                        !getAtom(index, atomIndex) || getAtom(index, atomIndex)?.blank,
                      "border-solid border-gray-100 bg-gray-50":
                        getAtom(index, atomIndex) && !getAtom(index, atomIndex)?.blank,
                    })}
                  >
                    <p className="text-xs text-gray-400">{atom.hint || "暂无描述"}</p>
                    <div className="mt-5">
                      {getAtom(index, atomIndex)?.blank === false ? (
                        <ReadableValue value={getAtom(index, atomIndex)} descriptor={atom} />
                      ) : (
                        <div className="rounded text-black text-opacity-60 leading-5">暂未设置</div>
                      )}
                    </div>
                  </div>
                ))}
              </List>
            </div>
          </div>
        ))}
      </List>
    );
  },
);

const OutputParams: React.FC<{ blocFunction: FunctionItem; blocNode: BasicBloc }> = observer(({ blocFunction }) => {
  const store = useContext(StoreContext);
  const nodes = store.nodes;
  const node = nodes.get(store.nodeDrawerId);
  if (!node) return null;
  return (
    <List>
      {blocFunction.opt.map((item, index) => (
        <div key={item.key} className="mb-8">
          <div className="flex items-center">
            {/* <span className="w-2 h-2 inline-block bg-black bg-opacity-5 rounded-full"></span> */}
            <span className="w-8 h-8 inline-flex justify-center items-center bloc-card rounded-full">{index + 1}</span>
            <div className="flex-1 ml-2">
              <p
                className="font-monaco text-xs text-gray-400"
                style={{
                  height: 20,
                }}
              >
                {item.key}
              </p>

              <p className="mt-1 text-sm">{item.description || "暂无描述"}</p>
            </div>
          </div>
        </div>
      ))}
    </List>
  );
});

const Info: React.FC<Omit<DrawerProps, "title" | "isCloseButtonShown" | "isOpen">> = observer(
  ({ className, onClose, ...rest }) => {
    const store = useContext(StoreContext);
    const nodes = store.nodes;
    const node = nodes.get(store.nodeDrawerId);
    const blocId = node?.blocId;
    const bloc = store.flattenFunctions.find((item) => item.id === blocId);
    const mergedOnClose = useCallback(
      (e: React.SyntheticEvent<HTMLElement, Event>) => {
        store.closeNodeDrawer();
        onClose?.(e);
      },
      [onClose, store],
    );
    if (!node) return null;
    if (!bloc) return null;
    return (
      <Drawer
        isOpen={store.nodeDrawerVisible}
        size={Drawer.SIZE_SMALL}
        isCloseButtonShown
        title="节点详情"
        className={classNames("h-screen overflow-y-auto", className)}
        onClose={mergedOnClose}
        {...rest}
      >
        <div className="p-5">
          <p className="text-xl font-medium">{bloc.name}</p>
          <p className="mt-2 text-sm text-gray-400">{bloc.description}</p>
          <Tabs className="mt-6">
            <Tab id="rx" title="接收参数" panel={<InputParams blocFunction={bloc} blocNode={node} />} />
            <Tab id="ng" title="输出数据" panel={<OutputParams blocFunction={bloc} blocNode={node} />} />
          </Tabs>
        </div>
      </Drawer>
    );
  },
);

export default Info;
