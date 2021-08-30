import { getFunctions } from "@/api/bloc";
import { getDetail, getDraft, getLatestRunningState } from "@/api/flow";
import { makeObservable, observable, runInAction, IReactionDisposer } from "mobx";
import { Store } from "./index";

export class Request {
  private disposers: IReactionDisposer[] = [];
  @observable fetching = false;

  constructor(private root: Store) {
    makeObservable(this);
  }
  async fetchDetail(originId: string, type: "detail" | "draft") {
    if (!originId) return;
    this.root.setOriginId(originId);
    runInAction(() => {
      this.fetching = true;
    });
    const result = type === "detail" ? await getDetail(originId) : await getDraft(originId);
    if (result.isValid) {
      this.root.setDetail(result.data);
    }
    runInAction(() => {
      this.fetching = false;
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
      this.root.setBlocs(data);
    }
  }
}
