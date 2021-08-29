import hotkeys from "hotkeys-js";
import {
  Canvas,
  ConnectionLine,
  NodeType,
  LogicNode,
  isConnectionLine,
  isTriggerNode,
  isLogicNode,
} from "@/fabric/objects";
import { ConfirmPlugin } from "@/components/plugins";

function removeTriggerNodes(canvas: Canvas) {
  const triggerNodes = canvas._objects.filter((object) => isTriggerNode(object));
  triggerNodes.forEach((trigger) => {
    canvas.remove(trigger);
  });
}
export const hotkeysPlugin = {
  install(canvas: Canvas) {
    let active = false;
    hotkeys("backspace", () => {
      if (active) return;
      const selectdObjects = canvas.getActiveObjects();
      if (!selectdObjects.length || canvas.disableHotkeys) return;
      const canDeleteNodes = selectdObjects.every((item) => isLogicNode(item) && item.nodeType === NodeType.feature);
      const canDisconnect = selectdObjects.every((item) => isConnectionLine(item));
      const handleDeleteNodes = async () => {
        active = true;
        const confirmed = await ConfirmPlugin({
          title: "确认要删除此节点吗？",
          body: "与此节点相关的关联也将被一并删除。",
        });
        active = false;
        if (confirmed) {
          (selectdObjects as LogicNode[]).forEach((node) => {
            node.destroy();
          });
          removeTriggerNodes(canvas);
        }
      };
      const handleDisconnect = async () => {
        active = true;
        const confirmed = await ConfirmPlugin({
          title: "确认要删除此节点吗？",
          body: "与此节点相关的关联也将被一并删除。",
        });
        if (confirmed) {
          selectdObjects.forEach((item) => {
            (item as ConnectionLine).destroy();
          });
        }
        active = false;
      };
      if (canDeleteNodes) {
        handleDeleteNodes();
      }
      if (canDisconnect) {
        handleDisconnect();
      }
    });
    hotkeys("space", { keyup: true }, (e) => {
      const keydown = e.type === "keydown";
      canvas.spacebarPressed = keydown;
    });
  },
};
