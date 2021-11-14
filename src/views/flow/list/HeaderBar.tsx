import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import { Button, ContainButton, Icon, Tooltip2 } from "@/components";
import { StoreContext } from "../item/store";
import { observer } from "mobx-react-lite";

type HeaderBarProps = React.HTMLProps<HTMLElement>;

const HeaderBar: React.FC<HeaderBarProps> = observer(({ className, ...rest }) => {
  const store = useContext(StoreContext);
  return (
    <header
      className={classNames("absolute lef-0 w-full bg-white px-4 shadow-sm h-14 z-10 flex items-center", className)}
      {...rest}
    >
      <p className="flex-1">{store.detail?.name || "未命名"}</p>
      {store.canRun && (
        <div className="flex-1 text-center flex items-center justify-center">
          {store.isFailed && (
            <Tooltip2 content="立即运行" placement="bottom">
              <Button icon="refresh" className="mr-4 !bg-transparent rounded-xl px-4 font-medium">
                重新运行
              </Button>
            </Tooltip2>
          )}
          {store.isIdle && (
            <Tooltip2 content="立即运行" placement="bottom">
              <Button icon="play" className="mr-4 !bg-transparent rounded-xl px-4 font-medium">
                立即运行
              </Button>
            </Tooltip2>
          )}
        </div>
      )}
      <div className="flex-1 text-right">
        {store.canRun && (
          <Tooltip2 content="运行历史" placement="bottom">
            <Button icon="history" minimal className="mr-4" />
          </Tooltip2>
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
      </div>
    </header>
  );
});

export default HeaderBar;
