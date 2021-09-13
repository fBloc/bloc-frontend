import React, { useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { ContainButton, Icon, PlainButton } from "@/components";
import { DetailType, Nullable } from "@/common";
import { Store } from "./store";
import { Loading } from "@/components/Loading";

type ZoomProps = React.HTMLProps<HTMLDivElement> & {
  store: Store;
};

const Zoom: React.FC<ZoomProps> = observer(({ className, store, ...rest }) => {
  return (
    <div
      className={classNames("absolute right-6 bottom-6 bg-white rounded shadow px-2 flex items-center select-none", className)}
      {...rest}
    >
      <Icon
        icon="plus"
        className={classNames("p-2", {
          "opacity-20 cursor-not-allowed": store.zoomInDisabled,
          "cursor-pointer": !store.zoomInDisabled,
        })}
      />
      <Icon
        icon="minus"
        className={classNames("p-2 cursor-pointer mx-2", {
          "opacity-20 cursor-not-allowed": store.zoomOutDisabled,
          "cursor-pointer": !store.zoomOutDisabled,
        })}
      />
      <span className="w-12 text-center cursor-pointer">{store.intZoom}%</span>
    </div>
  );
});
type BoardProps = React.HTMLProps<HTMLDivElement> & {
  originId: string;
  detailType?: DetailType;
  loading?: boolean;
  store: Store;
};

const Board: React.FC<BoardProps> = observer(({ originId, store, detailType, loading }) => {
  const ref = useRef<Nullable<HTMLCanvasElement>>(null);
  useEffect(() => {
    store.setup(ref.current);
    return () => {
      store.onBoardDestroy();
    };
  }, [store]);
  useEffect(() => {
    if (detailType) {
      store.detailType = detailType;
    }
  }, [detailType, store]);
  useEffect(() => {
    store.setOriginId(originId);
  }, [store, originId, detailType]);
  return (
    <>
      <div className="h-full">
        <canvas ref={ref}></canvas>
        <Zoom store={store} />
      </div>
      {!store.detail && !store.request.realFetching && (
        <div className="h-full absolute bg-white w-full top-0 left-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">还没有发布过此flow</p>
            <div className="mt-4 pb-40">
              <PlainButton>立即发布</PlainButton>
              <ContainButton
                className="ml-4"
                onClick={() => {
                  store.toEditMode();
                }}
              >
                继续编辑
              </ContainButton>
            </div>
          </div>
        </div>
      )}
      {store.request.realFetching && <Loading className="absolute" />}
    </>
  );
});

export default Board;
