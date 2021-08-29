import { createContext } from "react";
import { makeObservable, reaction, observable, action, IReactionDisposer } from "mobx";
import { FlowRunningState, IFlow } from "@/api/flow";
import { BlocGroup } from "@/common";
import { Request } from "./request";

export class Store {
  @observable detail?: IFlow;
  @observable runningState?: FlowRunningState;
  @observable blocs: BlocGroup[] = [];
  private disposers: IReactionDisposer[] = [];

  originId: string = "";
  private request!: Request;
  constructor() {
    makeObservable(this);
    this.request = new Request(this);
    this.disposers.push(reaction(() => this.detail, this.onDetailChange));
  }
  private onDetailChange = (detail?: IFlow) => {
    console.log(detail);
  };
  setDetail(detail: IFlow) {
    this.detail = detail;
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
  @action setBlocs(blocs: BlocGroup[]) {
    this.blocs = blocs;
  }
  setup(originId: string) {
    this.originId = originId;
    this.request.getDetail();
    this.request.getBlocs();
  }
}

export const StoreContext = createContext({} as Store);

export const StoreProvider = StoreContext.Provider;
