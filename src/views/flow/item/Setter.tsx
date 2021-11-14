import React, { memo, Suspense, useCallback, useContext, useState, useRef } from "react";
import {
  TypeTag,
  Dialog,
  MarginDivider,
  Tooltip2,
  Icon,
  SheetModal,
  Popover2,
  IconName,
  ButtonProps,
} from "@/components";
import { observer } from "mobx-react-lite";
import Editor from "./Editor";
import { ToastPlugin } from "@/components/plugins";
import { StoreContext as Context } from "./store";
import { ParamIpt, IptWay } from "@/api/flow";
import { FunctionItem, IAtom } from "@/api/bloc";
import { Button } from "@/components";
// import { getIsMultiple, getIsSelect } from "../store/params";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Nullable } from "@/common";
import { getIsMultiple, getIsSelect } from "./store/param";
import style from "./param.module.scss";

const EditorDialog: React.FC = observer(() => {
  const { param: store } = useContext(Context);
  const { readonly } = store;
  return (
    <Dialog
      isOpen={store.editorVisible}
      onClosed={store.onEditorExited}
      isCloseButtonShown={true}
      canOutsideClickClose={false}
      title="参数输入值"
      style={{
        width: 600,
      }}
      onClose={store.exitEditor}
    >
      <div className="pt-5 px-5">
        <Editor />
        <div className="mt-5 flex border-t border-solid border-gray-200 pt-5">
          {store.editorReadonly ? (
            <>
              {!readonly && (
                <Button autoFocus onClick={store.setEditorEditable} className="mx-auto">
                  修改
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                className="mx-auto"
                intent="primary"
                autoFocus
                onClick={() => {
                  const valid = store.isValueValid();
                  if (!valid) {
                    ToastPlugin({
                      message: "数据不合适。", // TODO
                    });
                  } else {
                    store.submitInputValue();
                  }
                }}
              >
                保存
              </Button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
});

const UnsetParam: React.FC<{ paramIndex: number; atomIndex: number; className?: string }> = observer(
  ({ paramIndex, atomIndex, className = "" }) => {
    const { param: store } = useContext(Context);
    const willDrop = store.willDrop(paramIndex, atomIndex);
    const allowDrop = store.allowDrop(paramIndex, atomIndex);
    const error = store.isError(paramIndex, atomIndex);
    const { readonly } = store;
    return (
      <div
        className={`${
          style.root
        } w-1/2 border border-dashed border-gray-400 rounded-lg flex-shrink-0 flex items-center justify-center ${className}
        ${willDrop ? "will-drop" : ""}
        ${error ? "error" : ""}
        ${allowDrop ? "allow-drop" : ""}`}
        style={{
          height: "112px",
        }}
        onDragOver={(e) => {
          store.onDragOver(e, paramIndex, atomIndex);
        }}
        onDragLeave={store.onLeaveAtomZone}
        onDrop={store.onDrop}
      >
        <div className={`mt-3 text-xs text-center ${store.dragging ? "pointer-events-none" : ""}`}>
          {willDrop && <p>松开手指</p>}
          {allowDrop && <p>继续拖动到这里</p>}
          {error && <p>数据类型不匹配</p>}
          {!willDrop && !allowDrop && !error && (
            <>
              <p className="text-gray-400 text-sm">{readonly ? "未设置" : "将数据源拖动到这里完成关联"}</p>
              {!readonly && (
                <p className="mt-1 text-gray-400 flex items-center justify-center">
                  或者，
                  <Button
                    color="primary"
                    minimal
                    intent="primary"
                    onClick={() => {
                      store.showEditor(paramIndex, atomIndex);
                    }}
                  >
                    手动设置
                  </Button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);

const getRgbaColor = (color: string, alpha = 1) => `rgba(${color}, ${alpha})`;
const IptMethodTag: React.FC<{ method: IptWay }> = memo(({ method }) => {
  const input = "132, 94, 194";
  const connection = "52, 101, 109";
  const isConnected = method === IptWay.Connection;
  return (
    <>
      <span
        className="inline-flex justify-center items-center w-8 h-8 rounded-full flex-shrink-0"
        style={{
          backgroundColor: isConnected ? getRgbaColor(connection, 0.1) : getRgbaColor(input, 0.1),
        }}
      >
        <Icon
          icon={isConnected ? "link" : "manually-entered-data"}
          iconSize={14}
          color={isConnected ? getRgbaColor(connection) : getRgbaColor(input)}
        />
      </span>
    </>
  );
});

export const ConfirButton: React.FC<{ confirmIcon?: IconName; onConfirm?: () => void } & ButtonProps> = ({
  icon,
  confirmIcon,
  children,
  onClick,
  onConfirm,
  className = "",
  ...rest
}) => {
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<Nullable<HTMLDivElement>>(null);

  const scopeClick: React.MouseEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (confirm) {
        onConfirm?.();
      }
      setConfirm(!confirm);
      onClick?.(e);
    },
    [onClick, confirm, onConfirm],
  );
  useClickOutside(ref, () => {
    setConfirm(false);
  });
  return (
    <div ref={ref} className="inline-block">
      <Button
        icon={confirm ? confirmIcon : icon}
        {...rest}
        onClick={scopeClick}
        className={`${className} ${confirm ? "visible" : "invisible"}`}
      >
        {children}
      </Button>
    </div>
  );
};

const SettedValue = observer<{
  paramIndex: number;
  atomIndex: number;
  method: IptWay;
}>(({ paramIndex, atomIndex, method, children }) => {
  const { param } = useContext(Context);
  const { readonly } = param;
  const value = param.atomValueViewer(paramIndex, atomIndex);
  const view = useCallback(() => {
    param.viewValue(paramIndex, atomIndex);
  }, [paramIndex, atomIndex, param]);
  const reset = useCallback(() => {
    param.clearAtomValue(paramIndex, atomIndex);
    param.exitEditor();
    ToastPlugin({
      message: "已清除",
    });
  }, [param, atomIndex, paramIndex]);
  if (!value || !value) return null;
  return (
    <div
      className={"w-1/2 rounded-lg flex-shrink-0 flex items-center p-5 group"}
      style={{
        background: "#f5f5f5",
        height: "112px",
      }}
    >
      <IptMethodTag method={method} />
      <div className="flex-grow px-5 text-ellipsis-max-line-3 leading-5">{children}</div>
      <div className="flex items-center justify-between">
        {method === IptWay.UserIpt && (
          <Tooltip2 content="查看" placement="top">
            <Button icon="eye-open" minimal onClick={view} className="invisible group-hover:visible" />
          </Tooltip2>
        )}
        {!readonly && (
          <Tooltip2 content="清除" placement="top">
            <ConfirButton
              className="ml-2 group-hover:visible"
              icon="trash"
              minimal
              intent="danger"
              confirmIcon="tick"
              onConfirm={reset}
            />
          </Tooltip2>
        )}
      </div>
    </div>
  );
});

const DisplayConnection: React.FC<{ value: ParamIpt }> = observer(({ value }) => {
  const store = useContext(Context);
  const flatFunction = store.functions.reduce((acc: FunctionItem[], item) => {
    return [...acc, ...item.functions];
  }, []);
  const blocId = store.nodes.get(value?.flow_function_id || "")?.blocId;
  const targetFunction = flatFunction.find((item) => item.id === blocId);
  const param = targetFunction?.opt.find((item) => item.key === value?.key);
  const content = (
    <div className="w-80 p-4">
      <p className="tetx-lg flex items-center">
        <span
          className="mr-1 px-1.5 py-0.5 text-white text-xs rounded font-medium"
          style={{
            backgroundColor: "#d8c292",
          }}
        >
          节点
        </span>
        {targetFunction?.name}
      </p>
      <p className="text-xs mt-1.5 text-gray-400">{targetFunction?.description}</p>
      <MarginDivider my={16} />
      <div>
        <span className="inline-block bg-black bg-opacity-5 tetx-xs py-0.5 px-1.5 rounded text-black text-opacity-60">
          {value?.key}
        </span>
        <p className="m-2 text-xs text-gray-400">{param?.description}</p>
      </div>
    </div>
  );
  return (
    <Popover2 enforceFocus={false} content={content} interactionKind="hover" placement="top" className="w-full">
      <>
        <p className="text-gray-400 text-xs font-monaco">{targetFunction?.name}</p>
        <p className="mt-1 font-monaco">{value?.key}</p>
      </>
    </Popover2>
  );
});
const ConfirmDisconnect: React.FC<ButtonProps & { onConfirm?: () => void }> = memo(
  ({ onClick, children, onConfirm, ...rest }) => {
    const [confirm, setConfirm] = useState(false);
    const ref = useRef<Nullable<HTMLDivElement>>(null);
    useClickOutside(ref, () => {
      setConfirm(false);
    });
    return (
      <div ref={ref} className="inline-block">
        {confirm ? (
          <Button {...rest} onClick={onConfirm} icon="tick">
            确认
          </Button>
        ) : (
          <Button
            outlined
            onClick={(e) => {
              onClick?.(e);
              setConfirm(true);
            }}
            {...rest}
          >
            取消关联
          </Button>
        )}
      </div>
    );
  },
);
export const ReadableValue = memo<{ value?: ParamIpt; descriptor?: IAtom }>(({ descriptor, value }) => {
  if (!descriptor || !value) return null;
  const realValue = value?.value;
  const { select_options } = descriptor;
  const isSelect = getIsSelect(descriptor);
  const isMultiple = getIsMultiple(descriptor);
  const method = value?.ipt_way;
  if (method === IptWay.Connection) return <DisplayConnection value={value} />;
  if (isSelect) {
    if (isMultiple) {
      return (
        <>
          {Array.isArray(realValue)
            ? realValue.map((atom) => select_options?.find((item) => item.value === atom)?.label).join("，")
            : select_options?.find((innerItem) => innerItem.value === realValue)?.label}
        </>
      );
    } else {
      return <>{select_options?.find((innerItem) => innerItem.value === realValue)?.label || "值为空"}</>;
    }
  }
  return <>{realValue?.toString()}</>;
});

const PreviewZone = observer<{ paramIndex: number; atomIndex: number }>(({ paramIndex, atomIndex }) => {
  const { param } = useContext(Context);
  const atomValue = param.atomValueViewer(paramIndex, atomIndex);
  if (!atomValue) return null;
  const { ipt_way } = atomValue;
  const atomDescriptor = param.getAtomDescriptorByIndex(paramIndex, atomIndex);
  return (
    <SettedValue paramIndex={paramIndex} atomIndex={atomIndex} method={ipt_way}>
      <ReadableValue value={atomValue} descriptor={atomDescriptor} />
    </SettedValue>
  );
});
const ParamSetter: React.FC = observer(() => {
  const store = useContext(Context);
  const { param } = store;
  const { readonly } = param;
  const { upstreamDescriptor, downstreamDescriptor, isUpstreamOutputEmpty } = param;
  const establishConnection = useCallback(() => {
    param.establishConenction();
  }, [param]);
  return (
    <div
      className="bg-gray-50 flex flex-col relative rounded-t-2xl"
      style={{
        height: "calc(100vh - 40px)",
      }}
    >
      <Icon
        icon="cross"
        className="absolute -top-8 right-2 cursor-pointer p-2"
        color="#fff"
        onClick={() => {
          param.close();
        }}
      />
      <div
        className="bg-gray-100 flex h-14 items-center justify-center px-5 flex-shrink-0 border-solid border-b border-gray-200"
        style={{
          borderRadius: "inherit",
        }}
      >
        <span className="flex-1"></span>
        <div className="flex-1 font-medium text-lg text-center flex items-center justify-center">
          {upstreamDescriptor?.name ?? "开始节点"}
          <Icon icon="arrow-right" className="text-gray-400 mx-5" />
          {downstreamDescriptor?.name}
        </div>
        {readonly ? (
          <span className="flex-1"></span>
        ) : (
          <div className="flex-1 text-right">
            {param.isEdit ? (
              <ConfirmDisconnect intent="danger" onConfirm={param.disconnect}>
                取消关联
              </ConfirmDisconnect>
            ) : (
              <Button intent="primary" onClick={establishConnection} disabled={readonly}>
                创建关联
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="pl-8 pt-8 flex flex-grow overflow-auto">
        <div className="w-80 flex-shrink-0">
          <span
            className="rounded text-xs px-3 py-1"
            style={{
              backgroundColor: "rgba(var(--bloc-primary), 0.1)",
              border: "1px solid rgba(var(--bloc-primary), 1)",
              color: "rgba(var(--bloc-primary), 1)",
            }}
          >
            上游流程
          </span>
          <p className="text-lg mt-5">{upstreamDescriptor?.name}</p>
          <p className="text-gray-400 mt-2 leading-6 text-sm">{upstreamDescriptor?.description}</p>
          <MarginDivider my={20} />
          <div>
            <p className="text-xs font-medium text-gray-400">输出的数据</p>
            <ul className="mt-3">
              {upstreamDescriptor?.opt.map((paramItem, index) => (
                <li
                  key={paramItem.key}
                  className="mb-3 p-4 border-solid border-gray-200 border rounded-lg bg-white"
                  draggable={!readonly}
                  onDragStart={(e) => {
                    param.onDragStart(e, index);
                  }}
                  onDragEnd={param.reset}
                >
                  <p className="font-monaco flex items-center justify-between">
                    {paramItem.key}
                    <TypeTag value={paramItem.value_type} style={{ transformOrigin: "right center" }} />
                  </p>
                  <p className="mt-2 text-gray-400 text-xs">{paramItem.description || "暂无描述"}</p>
                </li>
              ))}
            </ul>
            {isUpstreamOutputEmpty && <p className="mt-2 bg-gray-100 p-5 rounded">:( 此流程无输出数据</p>}
          </div>
        </div>
        <MarginDivider
          mx={30}
          style={{
            width: "1px",
          }}
        />
        <div className="flex-grow pb-8 pr-8 overflow-auto">
          <span
            className="inline-block rounded text-xs px-3 py-1"
            style={{
              backgroundColor: "rgba(var(--bloc-primary), 0.1)",
              border: "1px solid rgba(var(--bloc-primary), 1)",
              color: "rgba(var(--bloc-primary), 1)",
            }}
          >
            下游流程
          </span>
          <p className="text-lg mt-5">{downstreamDescriptor?.name}</p>
          <p className="text-gray-400 mt-2 leading-6 text-sm">{downstreamDescriptor?.description || "暂无描述"}</p>
          <MarginDivider my={20} />
          <ul>
            {downstreamDescriptor?.ipt.map((item, paramIndex) => (
              <li key={item.key} className="mb-8">
                <div className="flex items-center">
                  <span
                    className="rounded-full bg-white border border-gray-200 text-center text-xl flex-shrink-0"
                    style={{
                      width: 42,
                      lineHeight: "40px",
                    }}
                  >
                    {paramIndex + 1}
                  </span>
                  <div className="m-3">
                    <p>
                      <span className="font-monaco">{item.key}</span>
                      {item.must && <span className="ml-5 text-red-600">必填</span>}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">{item.display}</p>
                    <p></p>
                  </div>
                </div>
                <ul className="flex flex-wrap -ml-2">
                  {item.components.map((atomItem, atomIndex) => (
                    <li className="2xl:w-1/2 w-full p-2" key={atomIndex}>
                      <div className="border border-solid rounded-lg border-gray-200 bg-white p-5 flex items-center">
                        {param.atomValueViewer(paramIndex, atomIndex)?.blank === false ? (
                          <PreviewZone paramIndex={paramIndex} atomIndex={atomIndex} />
                        ) : (
                          <UnsetParam paramIndex={paramIndex} atomIndex={atomIndex} />
                        )}

                        <div className="ml-5">
                          <TypeTag value={atomItem.value_type} />
                          <p className="mt-3 line-clamp-2 text-gray-400">{atomItem.hint || "暂无描述"}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <EditorDialog />
    </div>
  );
});

export const DialogParams = observer(() => {
  const { param } = useContext(Context);
  return (
    <SheetModal open={param.open} onExited={param.onExited}>
      <ParamSetter />
    </SheetModal>
  );
});

export default DialogParams;
