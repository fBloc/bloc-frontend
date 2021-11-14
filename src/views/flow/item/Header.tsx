import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";
import {
  Button,
  LogoRoute,
  EditableText,
  Tooltip2,
  Icon,
  ContainButton,
  PlainButton,
  Divider,
  Popover2,
  Menu,
  Position,
  MenuItem,
  Spinner,
} from "@/components";
import { StoreContext } from "./store";
import { prettierCoordinates } from "@/fabric/tools/prettierCoordinates";
import { getReadableTime } from "@/utils";
import Settings from "./Settings";
import History from "./History";
import Run from "./Run";
import classNames from "classnames";
import { deleteDraft } from "@/api/flow";

const Header = observer<React.HTMLProps<HTMLElement>, HTMLElement>(
  (props, ref) => {
    const store = useContext(StoreContext);
    const history = useHistory();
    const [name, setName] = useState("");
    const updateName = useCallback(() => {
      store.request.update({
        name,
      });
    }, [name, store]);
    const edit = useCallback(() => {
      store.toEditMode();
    }, [store]);
    const toReadonly = useCallback(() => {
      store.toReadMode();
    }, [store]);
    const prettier = useCallback(() => {
      const entry = store.startNode;
      if (store.canvas && entry) {
        prettierCoordinates(store.canvas, entry);
        store.request.onNodesChange();
      }
    }, [store]);

    useEffect(() => {
      return reaction(
        () => store.detail?.name,
        (name) => {
          setName(typeof name === "string" ? name || "未命名" : "");
        },
        {
          fireImmediately: true,
        },
      );
    }, [store]);
    return (
      <header className="h-14 px-4 bg-white flex-shrink-0 shadow flex items-center">
        <Link to="/flow">
          <Button icon="chevron-left" minimal={true} className="mr-2" />
        </Link>
        <LogoRoute to="/" />
        <span
          className="ml-3 inline-flex px-2 items-center bg-gray-700 rounded-full text-white"
          style={{
            height: 22,
          }}
        >
          <Icon icon="cube" iconSize={12} className="mr-2" />
          <span className="font-medium text-xs">Flow</span>
        </span>
        <EditableText
          className={classNames("ml-6 mr-4 w-40 px-1", { invisible: !store.detail })}
          value={name}
          placeholder="输入名称"
          disabled={!store.editing}
          onChange={setName}
          onConfirm={updateName}
        />
        {store.editing ? (
          store.request.updating ? (
            <>
              <Spinner size={14} />
              <span>更新中...</span>
            </>
          ) : (
            store.request.updateTime > 0 && (
              <span className="opacity-40">{getReadableTime(store.request.updateTime)} 更新</span>
            )
          )
        ) : null}

        <div className="ml-auto flex items-center">
          <History />
          <Settings />
          <Run />
          {store.canEdit && !store.editing && (
            <ContainButton icon="edit" onClick={edit}>
              编辑
            </ContainButton>
          )}

          {store.editing && (
            <>
              <Tooltip2 content="自动规整" placement="bottom">
                <Button icon="diagram-tree" className="mr-2" minimal onClick={prettier} />
              </Tooltip2>
              <Divider className="h-4 mx-3" />
              {/* <PlainButton className="w-24 !border-none">退出编辑</PlainButton> */}
              <Button minimal onClick={toReadonly}>
                退出编辑
              </Button>
              <PlainButton className="w-20 mx-3">保存</PlainButton>
              <ContainButton className="w-20" onClick={edit}>
                发布
              </ContainButton>
              <Popover2
                content={
                  <Menu>
                    <MenuItem
                      icon="trash"
                      text="删除"
                      intent="danger"
                      onClick={async () => {
                        const { isValid } = await deleteDraft(store.originId);
                        if (isValid) {
                          history.push("/flow");
                        }
                      }}
                    />
                  </Menu>
                }
                position={Position.BOTTOM_RIGHT}
              >
                <Tooltip2 content="更多" placement="bottom">
                  <Button icon="more" className="ml-3 rotate-90" minimal />
                </Tooltip2>
              </Popover2>
            </>
          )}
        </div>
      </header>
    );
  },
  { forwardRef: true },
);

export default Header;
