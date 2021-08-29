import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";
import { getReadableTime } from "@/utils";
import { IInValidNode, isValidChain } from "@/fabric/tools/valiator";
import { Button, LogoRoute, EditableText, Spinner, Tooltip2, Colors, Icon, Dialog, ToastPlugin } from "@/components";
import { StoreContext } from "./store";
import { findLogicNodeById, getLogicNodes } from "@/fabric/tools";
import { prettierCoordinates } from "@/fabric/tools/prettierCoordinates";
import RunningState from "@/components/RunningState";

const ViewOperations: React.FC<React.HTMLProps<HTMLDivElement>> = observer((props) => {
  const { className = "", ...rest } = props;
  const store = useContext(Context);
  const allowExcute = false;
  const enterEditMode = useCallback(async () => {
    // store.enterEditMode();
  }, [store]);
  const run = useCallback(async () => {
    // const { isValid } = await request.run();
  }, []);

  return (
    <div className={`flex items-center text-xs ${className}`} {...rest}>
      <span className="mr-4 text-gray-400">当前处于只读模式</span>
      <Button color="primary" onClick={enterEditMode} outlined className="mr-2">
        进入编辑模式
      </Button>
      {!allowExcute && (
        <Tooltip2 content="立即执行">
          <Button style={{ borderRadius: "50%" }} onClick={run} icon="play" />
        </Tooltip2>
      )}
    </div>
  );
});

const EditOptions = observer(() => {
  const store = useContext(Context);
  const [alertOpen, setAlertOpen] = useState(false);
  const [nodes, setNodes] = useState<IInValidNode[]>([]);
  const { request } = store;
  const history = useHistory();
  const autoAlign = useCallback(() => {
    // instance && align(instance); // TODO
    const canvas = store.canvas.instance;
    const entry = findLogicNodeById(canvas, "0"); // TODO 表示特殊0
    if (canvas && entry) {
      prettierCoordinates(canvas, entry);
    }
  }, [store.canvas.instance]);
  const launch = useCallback(async () => {
    const { isValid: canLaunch, inValidNodes } = isValidChain(getLogicNodes(store.canvas.instance));
    if (!canLaunch) {
      setAlertOpen(true);
      setNodes(inValidNodes);
      return;
    }
    const { isValid } = await request.launch();
    if (isValid) {
      ToastPlugin({
        message: "已发布！",
      });
      history.push("/flow");
    }
  }, [request, store.canvas.instance, history]);
  const exitEdit = useCallback(async () => {
    store.enterViewMode();
  }, [store]);
  return (
    <>
      <div className="inline-flex item-center">
        <Button onClick={exitEdit} outlined>
          退出编辑
        </Button>
        <Button color="default" onClick={autoAlign} className="mx-3" outlined>
          位置规整
        </Button>
        <Button color="primary" onClick={launch} intent="primary">
          发布
        </Button>
      </div>
      <Dialog
        isOpen={alertOpen}
        style={{
          width: 700,
          paddingBottom: 0,
        }}
        canOutsideClickClose={false}
        onClose={() => {
          setAlertOpen(false);
        }}
      >
        <div className="px-10 py-6">
          <p className="text-center">
            <Icon icon="warning-sign" iconSize={56} color="#d81f25" />
          </p>
          <p className="mt-5 text-xl text-center font-medium">不能发布此flow</p>
          <p className="mt-2 text-sm text-gray-400">
            若要发布此flow，则每个节点都必须关联至少一个上游节点或下游节点，请检查以下节点：
          </p>
          <div className="mt-16 flex flex-wrap">
            {nodes.map((item) => (
              <div key={item.nodeId} className="odd:pr-1 even:pl-1 w-1/2 mb-2">
                <div className="bg-black bg-opacity-5 p-4 rounded">
                  <p>{item.name}</p>
                  <p className="text-red-600 text-xs mt-2">{item.erororText}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button
              intent="primary"
              large
              onClick={() => {
                setAlertOpen(false);
              }}
            >
              我知道了
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
});

const Header = observer<React.HTMLProps<HTMLElement>, HTMLElement>(
  (props, ref) => {
    const store = useContext(StoreContext);
    const {
      canvas: { viewOnly },
    } = store;
    const [name, setName] = useState("");
    const updateName = useCallback(async () => {
      await store.request.update({
        name,
      });
      // TODO
    }, [name, store.request]);
    useEffect(() => {
      const disposer = reaction(
        () => store.request.detail?.name,
        (v) => {
          setName(v || "");
        },
      );
      return () => {
        disposer();
      };
    }, [store.request.detail?.name]);

    return (
      <header className="px-4 flex items-center justify-between h-16 flex-shrink-0 bg-white shadow-sm" ref={ref}>
        <div className="flex items-center flex-1">
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
            <span className="font-medium text-xs">素材</span>
          </span>
          <EditableText
            className="ml-6 w-40"
            value={name}
            placeholder="输入名称"
            onChange={setName}
            onConfirm={updateName}
            disabled={viewOnly}
          />
          <span className="inline-flex items-center ml-5 text-gray-400">
            <span className={`inline-block w-3 h-3 mr-2 ${store.request.isUpdating ? "" : "invisible"}`}>
              <Spinner size={12} />
            </span>
            <span className="text-xs">{!store.request.isUpdating && getReadableTime(store.request.updateTime)}</span>
          </span>
        </div>
        {store.request.state && (
          <div
            className="ml-auto flex items-center px-10 mr-10"
            style={{
              borderRight: "1px solid #eaeaea",
              color: Colors.GREEN4,
            }}
          >
            {/* <State
            record={{
              status: "成功",
              time: "2020-11-23 11:32:23",
            }}
          ></State> */}
            <Icon icon="tick-circle" color={Colors.GREEN4} size={20} />
            <div className="ml-3">
              <p className="text-xs font-bold">{store.request.state.status}</p>
              <p className="mt-1 text-xs text-gray-500">{store.request.state.end_time}</p>
            </div>
          </div>
        )}
        <div className="text-right flex items-center justify-end">
          {viewOnly ? <ViewOperations /> : <EditOptions />}
          <img
            src="https://tva1.sinaimg.cn/large/008eGmZEly1gpnzkklyo5j30qn0qntc4.jpg"
            className="ml-4 w-5 h-5 rounded-full inline-block"
            alt="头像"
          />
        </div>
      </header>
    );
  },
  { forwardRef: true },
);

export default Header;
