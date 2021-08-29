import React, { useRef, useEffect } from "react";
import { Nullable, RunningEnum } from "@/common";
import { Store } from "./store/";
import { useMemo } from "react";
import { Colors, ContainButton, Divider, Icon, PlainButton, Spinner } from "@/components";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { NavLink } from "react-router-dom";
export interface BoardProps extends React.HTMLProps<HTMLDivElement> {
  originId: string;
}

const Board: React.FC<BoardProps> = observer(({ originId }) => {
  const ref = useRef<Nullable<HTMLCanvasElement>>(null);
  const store = useMemo(() => new Store(), []);
  const { request, ui } = store;

  useEffect(() => {
    store.render(ref.current, originId);
  }, [originId, store]);

  if (!originId)
    return (
      <div className="h-full flex justify-center items-center">
        <p className="text-gray-500 text-sm">选择一个Flow进行查看</p>
      </div>
    );

  return (
    <>
      <header className="absolute lef-0 w-full bg-white px-4 shadow-sm h-14 z-10 flex items-center">
        <p className="flex-grow">{store.detail?.name}</p>
        {store.runningState && (
          <>
            <Icon icon="tick-circle" color={Colors.GREEN4} size={20} />
            <div className="ml-3">
              <p className="text-xs font-bold">{store.runningState?.status}</p>
              <p className="mt-1 text-xs text-gray-500">{store.runningState?.end_time}</p>
            </div>
            <Divider className="mx-8 h-6" />
          </>
        )}
        {store.runningState?.status && store.runningState?.status !== RunningEnum.running && (
          <PlainButton className="px-4 mr-4">
            <span>立即运行</span>
          </PlainButton>
        )}
        <NavLink
          to={`/flow/${store.detail?.origin_id}`}
          target="_blank"
          className="hover:!text-current hover:no-underline"
        >
          <ContainButton className="!px-4">
            <Icon icon="edit" className="mr-2" size={14}></Icon>
            <span>编辑</span>
          </ContainButton>
        </NavLink>
      </header>
      <canvas ref={ref}></canvas>
      {request.fetching && <Spinner className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />}
      <div className="absolute right-6 bottom-6 bg-white rounded shadow px-2 flex items-center select-none">
        <Icon
          icon="plus"
          className={classNames("p-2", {
            "opacity-20 cursor-not-allowed": ui.zoomInDisabled,
            "cursor-pointer": !ui.zoomInDisabled,
          })}
        ></Icon>
        <Icon
          icon="minus"
          className={classNames("p-2 cursor-pointer mx-2", {
            "opacity-20 cursor-not-allowed": ui.zoomOutDisabled,
            "cursor-pointer": !ui.zoomOutDisabled,
          })}
        ></Icon>
        <span className="w-12 text-center cursor-pointer">{ui.intZoom}%</span>
      </div>
    </>
  );
});

export default Board;
