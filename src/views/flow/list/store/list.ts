import { createContext } from "react";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import {
  createDraft,
  deleteDraft,
  deleteItem,
  getDraftList,
  getList,
  DraftFlowListItem,
  LaunchedFlowListItem,
  BaseFlowItem,
} from "@/api/flow";
import { ToastPlugin } from "@/components/plugins";
import { DetailType } from "@/common";
import { DEFAULT_START_NODE_ID } from "@/fabric/tools";
export class ListStore {
  @observable list: LaunchedFlowListItem[] = [];
  @observable draftList: DraftFlowListItem[] = [];
  @observable currentList: BaseFlowItem[] = [];
  @observable tab = DetailType.launched;
  @observable index = -1;
  @observable name = "";
  @observable loading = false;
  @computed get data() {
    return this.tab === DetailType.launched ? this.list : this.draftList;
  }
  @computed get canUserDelete() {
    return false;
  }
  @computed get currentFlow() {
    return this.currentList[this.index];
  }
  constructor() {
    makeObservable(this);
  }
  createDraft() {
    return createDraft({
      position: {
        left: 200,
        top: 100,
      },
      flowFunctionID_map_flowFunction: {
        [DEFAULT_START_NODE_ID.LITERANL]: {
          note: "开始节点",
          position: {
            left: 400,
            top: 100,
            zoom: 0,
          },
          function_id: "4c0e909e-4176-4ce2-a3f6-f30dab71c936",
          upstream_flowfunction_ids: [],
          downstream_flowfunction_ids: [],
          param_ipts: [],
        },
      },
    });
  }
  @action switchTab(tab: DetailType) {
    this.index = -1;
    this.tab = tab;
  }
  @action setIndex(index: number) {
    this.index = index;
  }
  async getList() {
    if (this.list.length > 0) return;
    const { data, isValid } = await getList({
      contains: this.name,
    });
    if (data && isValid) {
      runInAction(() => {
        this.list = data;
      });
    }
  }
  async getDraftList() {
    if (this.draftList.length > 0) return;
    const { data, isValid } = await getDraftList({
      contains: this.name,
    });
    if (data && isValid) {
      runInAction(() => {
        this.draftList = data;
      });
    }
  }
  private async deleteItem(originId: string) {
    const { isValid } = await deleteItem(originId);
    if (isValid) {
      runInAction(() => {
        this.list = this.list.filter((item) => item.origin_id !== originId);
        this.index = -1;
      });
      ToastPlugin({
        message: "已删除",
      });
    }
  }
  private async deleteDraft(originId: string) {
    const { isValid } = await deleteDraft(originId);
    if (isValid) {
      runInAction(() => {
        this.draftList = this.draftList.filter((item) => item.origin_id !== originId);
        this.index = -1;
      });
      ToastPlugin({
        message: "已删除",
      });
    }
  }
  async fetchList() {
    runInAction(() => {
      this.loading = true;
    });
    this.tab === DetailType.launched ? await this.getList() : await this.getDraftList();
    runInAction(() => {
      this.loading = false;
    });
  }
  async delete(id: string) {
    await (this.tab === DetailType.launched ? this.deleteItem(id) : this.deleteDraft(id));
    this.setCurrentList();
  }
  onInputName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.name = e.currentTarget.value;
  };
  onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.fetchList();
    }
  };
  @action setCurrentList() {
    this.currentList = this.tab === DetailType.draft ? this.draftList : this.list;
  }
  @action filterList(name: string) {
    const source = this.tab === DetailType.draft ? this.draftList : this.list;
    this.currentList = source.filter((item) => item.name.includes(name));
    this.setIndex(-1);
  }
  viewIndex(index: number) {
    this.index = index;
  }
}

export const ListContext = createContext({} as ListStore);
