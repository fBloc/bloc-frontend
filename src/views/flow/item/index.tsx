import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import Header from "./Header";
import { StoreProvider, FlowItemStore as Store } from "./store";
import Board from "../board";
import { LazyComponent, Spinner } from "@/components";
import Portal from "@/components/Portal";
const Setter = React.lazy(() => import("./Setter"));
const Functions = React.lazy(() => import("./Functions"));

const Loading = (
  <Portal>
    <div className="fixed left-1/2 top-1/2 bg-white p-4 rounded -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </div>
  </Portal>
);
const Item = observer(() => {
  const store = useMemo(() => new Store(), []);
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    store.getFunctions();
    return () => {
      store.onBoardDestroy();
    };
  }, [store]);
  return (
    <StoreProvider value={store}>
      <div className="h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow relative">
          <div className="absolute left-0 top-0 bottom-0 z-10">
            <LazyComponent open={store.editable} fallback={Loading}>
              <Functions className="h-full p-3" />
            </LazyComponent>
          </div>
          <Board originId={id} store={store} />
          <LazyComponent open={store.param.open} fallback={Loading}>
            <Setter />
          </LazyComponent>
        </main>
      </div>
    </StoreProvider>
  );
});

export default Item;
