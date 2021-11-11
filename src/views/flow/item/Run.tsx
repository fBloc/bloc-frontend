import { triggerRun } from "@/api/flow";
import { Button, ToastPlugin, Tooltip2 } from "@/components";
import { AppStoreContext } from "@/store";
import useRequest from "@umijs/use-request";
import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { StoreContext } from "./store";

const Run = observer(() => {
  const { run: runManualy } = useRequest(triggerRun, {
    manual: true,
  });
  const store = useContext(StoreContext);
  const appStore = useContext(AppStoreContext);
  if (store.editing) return null;
  return (
    <Tooltip2 content="立即运行" placement="bottom" disabled={!store.canRun}>
      <Button
        disabled={!store.canRun}
        icon="play"
        className="mr-4 !bg-transparent rounded-md px-4 font-medium"
        onClick={async () => {
          const { isValid } = await runManualy({
            userToken: appStore.token,
            flowOriginId: store.originId,
          });
          if (isValid) {
            ToastPlugin({
              message: "已触发！",
            });
          }
        }}
      >
        立即运行
      </Button>
    </Tooltip2>
  );
});
export default Run;
