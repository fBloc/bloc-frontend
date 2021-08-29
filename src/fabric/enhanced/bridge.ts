import { ConnectionLine, LogicNode } from "@/fabric/objects";

export abstract class NodeBridge {
  abstract generateNode(): LogicNode;
  abstract isShowDropHelper(e: fabric.IEvent): { result: boolean; left: number; top: number };
  abstract isShowLineDropHelper(e: fabric.IEvent): { result: boolean; left: number; top: number };
  abstract isUpstream(node: unknown): boolean;

  abstract onNodeAdded(node: LogicNode): void;
  abstract onMouseDown(e: fabric.IEvent): void;
  abstract onNodesMoved(): void;
  abstract onNodesRemoved(node: unknown): void;
  abstract onConnect(line: ConnectionLine): void;
  abstract onPureClick(e: fabric.IEvent): void;
  abstract onDisconnect(ustreamNode?: LogicNode, downstreamNode?: LogicNode): void;
  abstract onCanvasSettingsChange(): void;
  abstract onClickConnectionLine(line: ConnectionLine): void;
}
