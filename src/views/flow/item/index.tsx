import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { StoreProvider, Store } from "./store";
import { useParams } from "react-router-dom";

const Item = observer(() => {
  const store = useMemo(() => new Store(), []);
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    store.setup(id);
  }, [store, id]);
  return (
    <StoreProvider value={store}>
      <div>hello</div>
    </StoreProvider>
  );
});

export default Item;
