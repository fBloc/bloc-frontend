import { getFunctions } from "@/api/bloc";
import {
  BlocItem,
  FlowDetailT,
  getDetail,
  getDraft,
  getLatestRunningState,
  updateDraft,
  createDraft,
  normalizeFlowDetail,
  deleteDraft,
} from "@/api/flow";
import { debounce, DetailType } from "@/common";
import { isBlocNode } from "@/fabric/objects";
import { makeObservable, observable, runInAction } from "mobx";
import { FlowItemStore as Store } from "./index";

export class Request {
  @observable fetching = false;
  @observable updating = false;
  @observable updateTime = 0;
  disableSync = false; // 切换详情时禁用发送请求
  @observable realFetching = false;
  constructor(private root: Store) {
    makeObservable(this);
  }
  async fetchDetail(type: DetailType) {
    const originId = this.root.originId;
    if (!originId || this.realFetching) return;
    this.root.setOriginId(originId);
    runInAction(() => {
      this.realFetching = true;
      this.updateTime = 0;
    });
    setTimeout(() => {
      if (this.realFetching) {
        runInAction(() => {
          this.fetching = true;
        });
      }
    }, 200);
    const result = type === DetailType.launched ? await getDetail(originId) : await getDraft(originId);
    this.root.setDetail(result.data, result.isValid);
    if (result.isValid) {
      if (type === DetailType.draft && !result.data) {
        const { data, isValid } = await this.createDraft();
        if (isValid) {
          this.root.setDetail(data, isValid);
        }
      }
    }
    runInAction(() => {
      this.fetching = false;
      this.realFetching = false;
    });
  }
  async getRunningHistory() {
    const id = this.root.detail?.id;
    if (!id) return;
    const { isValid, data } = await getLatestRunningState(id);
    if (isValid) {
      this.root.setRunningHistory(data || []);
    }
  }
  toViewMode() {
    //
  }
  toEditMode() {
    //
  }
  patch(data: Partial<FlowDetailT>) {
    return updateDraft({
      id: this.root.detail?.id,
      ...data,
    });
  }
  private getNodes() {
    return this.root.canvas?._objects.filter(isBlocNode).reduce(
      (acc: Record<string, BlocItem>, item) => ({
        ...acc,
        [item.id]: item.getJson(),
      }),
      {},
    );
  }
  async onNodesChange() {
    await this.update({
      flowFunctionID_map_flowFunction: this.getNodes() || {},
    });
  }
  async onTransform() {
    if (this.disableSync) return;
    const info = this.root.getReadableTransformInfo();
    if (!info) {
      throw new Error("缺少position信息");
    }
    await this.update({
      position: info,
    });
  }
  async createDraft() {
    const { data: detail } = await getDetail(this.root.originId);
    return createDraft({
      origin_id: this.root.originId,
      flowFunctionID_map_flowFunction: detail?.flowFunctionID_map_flowFunction,
      position: detail?.position,
      name: detail?.name,
    }).then(normalizeFlowDetail);
  }
  @debounce(1000)
  async update(params: Partial<FlowDetailT>) {
    if (!this.root.editing) return;
    runInAction(() => {
      this.updating = true;
    });
    const result = await updateDraft({
      ...params,
      id: this.root.draftId,
      origin_id: this.root.originId,
    });
    if (result.isValid) {
      runInAction(() => {
        this.updateTime = Date.now();
      });
    }
    runInAction(() => {
      this.updating = false;
    });
    return result;
  }
}
