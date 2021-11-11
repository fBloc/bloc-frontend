import { makeObservable, observable, action, IReactionDisposer, computed, reaction } from "mobx";
import { Board } from "@/fabric/enhanced/board";
import { DetailType, Nullable } from "@/common";
import { LogicNode } from "@/fabric/objects";
import { isStartNode } from "@/fabric/tools";
interface WithRequest {
  request: { realFetching: boolean };
}
export abstract class Store<T extends { id: string } = any> extends Board implements WithRequest {
  disposers: IReactionDisposer[] = [];
  @observable detail: Nullable<T> = null;
  @observable originId = "";
  detailType = DetailType.launched;
  @observable editing = false;
  @observable zoom = 1;
  stopEvents = false;
  @computed get intZoom() {
    return parseInt(`${this.zoom * 100}`);
  }
  @computed get zoomOutDisabled() {
    return this.intZoom <= 10;
  }
  @computed get zoomInDisabled() {
    return this.intZoom >= 200;
  }
  get draftId() {
    return this.detail?.id;
  }
  abstract onDetailChange: () => void;
  abstract toReadMode(): Promise<void>;
  abstract toEditMode(): Promise<void>;
  abstract setup(el: HTMLCanvasElement | null): Promise<void>;
  abstract onOriginIdChange: () => Promise<void>;
  abstract request: { realFetching: boolean };
  constructor() {
    super();
    makeObservable(this);
    this.disposers.push(
      reaction(
        () => this.originId,
        () => {
          this.onOriginIdChange();
        },
      ),
    );
    this.disposers.push(
      reaction(
        () => this.detail,
        () => {
          this.onDetailChange();
        },
      ),
    );
    this.disposers.push(
      reaction(
        () => this.editing,
        (editing) => {
          const cursor = editing ? "default" : "grab";
          if (this.canvas?.hoverCursor) {
            this.canvas.hoverCursor = cursor;
            this.canvas.defaultCursor = cursor;
          }
          this.canvas?._objects.forEach((item) => {
            item.hoverCursor = cursor;
            item.moveCursor = cursor;
          });
        },
      ),
    );
  }
  preRenderNodes(nodes: LogicNode[], generateStartNode: () => LogicNode) {
    const lackStartNode = nodes.findIndex(isStartNode) === -1;
    const _nodes = [...nodes];
    if (lackStartNode) {
      _nodes.push(generateStartNode());
    }
    super.renderNodes(_nodes);
  }
  @action setZoom(value: number) {
    this.zoom = value;
  }
  @action setOriginId(id: string) {
    this.originId = id;
  }
  @action setDetail(detail: Nullable<T>) {
    this.detail = detail;
  }
  @action switchEditable(readonly: boolean) {
    this.editing = readonly;
  }
  onDestroy() {
    this.disposers.forEach((fn) => fn());
  }
}
