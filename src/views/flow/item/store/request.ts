import { getFunctions } from "@/api/bloc";
import {
  BlocItem,
  FlowDetailT,
  getDetail,
  getDraft,
  getLatestRunningState,
  updateDraft,
  createDraft,
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
    if (!originId) return;
    this.root.setOriginId(originId);
    runInAction(() => {
      this.realFetching = true;
    });
    setTimeout(() => {
      if (this.realFetching) {
        runInAction(() => {
          this.fetching = true;
        });
      }
    }, 200);
    const result = type === DetailType.launched ? await getDetail(originId) : await getDraft(originId);
    if (result.isValid) {
      this.root.setDetail(result.data);
      if (type === DetailType.draft && !result.data) {
        const { data, isValid } = await this.createDraft();
        if (isValid) {
          this.root.setDetail(data);
        }
      }
    }
    runInAction(() => {
      this.fetching = false;
      this.realFetching = false;
    });
  }

  async getRunningState() {
    const id = this.root.detail?.id;
    if (!id) return;
    const { isValid, data } = await getLatestRunningState(id);
    if (isValid) {
      this.root.setRunningState(data?.status ? data : null);
    }
  }
  toViewMode() {
    //
  }
  toEditMode() {
    //
  }
  async getBlocs() {
    const { data, isValid } = await getFunctions();
    if (isValid && data) {
      // this.root.setBlocs(data);
    }
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
      blocs: this.getNodes(),
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
  createDraft() {
    const detail = this.root.detail;
    return createDraft({
      origin_id: this.root.originId,
      blocs: detail?.blocs,
      position: detail?.position,
      name: detail?.name,
    });
  }
  @debounce(1000)
  async update(params: Partial<FlowDetailT>) {
    if (!this.root.editable) return;
    runInAction(() => {
      this.updating = true;
    });
    const result = await updateDraft({
      ...params,
      id: this.root.draftId,
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
