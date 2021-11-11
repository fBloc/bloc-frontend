import React, { useCallback, useContext, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { StoreContext } from "./store";
import { Icon, LazyComponent, Portal, Spinner } from "@/components";
import { Nullable } from "@/common";
import { useClickOutside } from "@/hooks";
import { sleep } from "@/utils";
import { reaction } from "mobx";

const Info = React.lazy(() => import("./Info"));

const Loading = (
  <Portal>
    <div className="fixed left-1/2 top-1/2 bg-white p-4 rounded -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </div>
  </Portal>
);

const Contextmenu = observer(() => {
  const store = useContext(StoreContext);
  const ref = useRef<Nullable<HTMLSpanElement>>(null);
  const close = useCallback(() => {
    if (store.nodeDrawerVisible || store.nodeDrawerId) return;
    store.hideMenuPopover();
  }, [store]);
  const { run, destroy } = useClickOutside(ref, close, true);
  useEffect(() => {
    return reaction(
      () => store.menuPopover.open,
      async (v) => {
        await sleep(100);
        v ? run() : destroy();
      },
    );
  }, [store, destroy, run]);
  return (
    <>
      <LazyComponent open={store.nodeDrawerVisible} fallback={Loading}>
        <Info />
      </LazyComponent>
      <span
        ref={ref}
        onClick={(e) => {
          store.showNodeDrawer();
        }}
        className={`bg-white rounded p-2 shadow inline-flex justify-center items-center absolute cursor-pointer left-0 top-0 ${
          store.menuPopover.open ? "" : "invisible"
        }`}
        style={{
          width: 100,
          transform: `translate(${store.menuPopover.left}px, ${store.menuPopover.top}px)`,
        }}
      >
        <Icon icon="database" iconSize={12} color="#888" className="mr-3" />
        <span className="text-xs">节点详情</span>
      </span>
    </>
  );
});
export default Contextmenu;
