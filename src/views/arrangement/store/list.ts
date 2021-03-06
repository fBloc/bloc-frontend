import { observable, action, makeObservable, computed, runInAction } from "mobx";
import { ConfirmPlugin, ToastPlugin } from "@/components/plugins";
import { Arrangement, getList, getDraftList, deleteItem, deleteDraft, createDraft } from "@/api/arrangement";
import { DetailType } from "@/common";
import { createContext } from "react";

export class ListStore {
  @observable list: Arrangement[] = [];
  @observable draftList: Arrangement[] = [];
  @observable tab = DetailType.launched;
  @observable index = -1;
  @observable name = "";
  @observable anchorEl?: HTMLButtonElement;
  @observable loading = false;
  @computed get data() {
    return this.tab === DetailType.launched ? this.list : this.draftList;
  }
  @computed get canUserDelete() {
    return this.index >= 0 ? this.data[this.index]?.super : false;
  }
  constructor() {
    makeObservable(this);
  }
  createDraft() {
    return createDraft({
      origin_id: "",
    });
  }
  @action switchTab(tab: DetailType) {
    this.index = -1;
    this.tab = tab;
  }
  @action serAnchorEl(el: HTMLButtonElement) {
    this.anchorEl = el;
  }
  @action setIndex(index: number) {
    this.index = index;
  }
  async getList() {
    this.setLoading(true);
    const { data, isValid } = await getList({
      contains: this.name,
    });
    if (isValid) {
      runInAction(() => {
        this.list = data || [];
      });
    }
    this.setLoading(false);
  }
  @action private setLoading(value: boolean) {
    this.loading = value;
  }
  async getDraftList() {
    this.setLoading(true);
    const { data, isValid } = await getDraftList({
      contains: this.name,
    });
    if (isValid) {
      runInAction(() => {
        this.draftList = data || [];
      });
    }
    this.setLoading(false);
  }
  private async deleteItem() {
    const originId = this.draftList[this.index].origin_id;
    const { isValid } = await deleteItem(originId);
    if (isValid) {
      runInAction(() => {
        this.list = this.list.filter((item) => item.origin_id !== originId);
        this.index = -1;
      });
      ToastPlugin({
        message: "?????????",
      });
    }
  }
  private async deleteDraft() {
    const originId = this.draftList[this.index].origin_id;
    const { isValid } = await deleteDraft(originId);
    if (isValid) {
      runInAction(() => {
        this.draftList = this.draftList.filter((item) => item.origin_id !== originId);
        this.index = -1;
      });
      ToastPlugin({
        message: "?????????",
      });
    }
  }
  search() {
    return this.tab === DetailType.launched ? this.getList() : this.getDraftList();
  }
  delete = async () => {
    this.handleClose();
    const confirmed = await ConfirmPlugin({
      title: "??????????????????????????????",
    });
    if (confirmed) {
      return this.tab === DetailType.launched ? this.deleteItem() : this.deleteDraft();
    }
  };
  onInputName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.name = e.currentTarget.value;
  };
  onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.search();
    }
  };
  handleClose = () => {
    runInAction(() => {
      this.anchorEl = undefined;
    });
  };
  @action handleClick(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    this.anchorEl = event.currentTarget;
    this.index = index;
  }
}

export const ListContext = createContext({} as ListStore);
