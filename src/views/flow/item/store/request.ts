import { getFunctions } from "@/api/bloc";
import { IAppResponse, ServerResponse } from "@/api/client";
import { getDetail, getDraft, IFlow } from "@/api/flow";
import { Nullable } from "@/common";
import { makeObservable, computed, reaction, observable, action, runInAction, IReactionDisposer } from "mobx";
import { Store } from "./index";

export class Request {
  private disposers: IReactionDisposer[] = [];
  constructor(private root: Store) {
    // makeObservable(this);
  }
  private setDetail = (response: IAppResponse<Nullable<IFlow>>) => {
    if (response.isValid && response.data) {
      this.root.setDetail(response.data);
    }
    return response;
  };
  getDetail() {
    return getDetail(this.root.originId).then(this.setDetail);
  }
  getDraft() {
    return getDraft(this.root.originId).then(this.setDetail);
  }
  getRunningState() {
    //
  }
  getDrafDetail() {
    //
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
