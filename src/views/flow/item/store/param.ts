import { IptWay, ValueType, ParamIpt, atomSetterTemplate } from "@/api/flow";
import { EditType, isString, isTruthyValue, isValidInputValue, Nullable, ParamTypeOptions } from "@/common";
import { ConfirmPlugin, ToastPlugin } from "@/components/plugins";
import { ConnectionLine } from "@/fabric/objects";
import { action, makeObservable, observable, runInAction, computed, reaction } from "mobx";
import { clone, equals } from "ramda";
import { FlowItemStore as RootStore } from "./index";
import { findLogicNodeById } from "@/fabric/tools";
import { FormControlType, IAtom, SelectOption } from "@/api/bloc";

const basicTypes = ["boolean", "number", "string"];
const isValidBaiscType = (value: unknown) => basicTypes.includes(typeof value) || value === null;

function isValidValue(value: unknown): value is ValueType | ValueType[] {
  if (isValidBaiscType(value)) return true;
  if (Array.isArray(value) && value.every((item) => isValidBaiscType(item))) return true;
  return false;
}
export function getIsSelect(atom?: IAtom) {
  return atom?.formcontrol_type === FormControlType.select;
}

export function transformValue(optionValue: NonNullable<ValueType>, value: string) {
  const type = typeof optionValue;
  switch (type) {
    case "boolean":
      return value === "true";
    case "number":
      return Number(value);
    default:
      return value;
  }
}

export function getTruthyOptions(options?: Nullable<SelectOption[]>) {
  return (options || []).filter(
    (item) => isTruthyValue(item.value) && ["string", "number"].includes(typeof item.value),
  ) as {
    label: string;
    value: string | number;
  }[];
}

export function getIsMultiple(atom?: IAtom) {
  return atom?.allow_multi;
}
export class Param {
  @observable open = false;
  @observable editorVisible = false;
  @observable upstreamNodeId = "";
  @observable downstreamNodeId = "";
  @observable upstreamParamIndex = -1;
  @observable downstreamParamIndex = -1;
  @observable downstreamAtomIndex = -1;
  @observable atomValue?: ValueType | ValueType[] = undefined;
  @observable value: ParamIpt[][] = [];
  @observable editType?: EditType;
  @observable editorReadonly = true;
  connectionLine?: ConnectionLine;
  private atomValueBackup?: ValueType | ValueType[];
  getIndexAtomValue(index: number) {
    return Array.isArray(this.atomValue) ? this.atomValue[index] : this.atomValue;
  }
  @computed get readonly() {
    return !this.root.editable;
  }
  constructor(private root: RootStore) {
    makeObservable(this);
    const disposer = reaction(
      () => this.open,
      (visible) => {
        if (this.root.canvas) {
          this.root.canvas.disableHotkeys = visible;
        }
      },
    );
    const disposer2 = reaction(
      () => this.downstreamNodeId,
      (id) => {
        const source = this.nodes.get(id)?.paramIpts || [];
        runInAction(() => {
          this.value = clone(source);
        });
      },
    );
    this.root.disposers.push(disposer, disposer2);
  }
  @action setSetterVisible(visible: boolean) {
    this.open = visible;
  }
  @computed get dragging() {
    return this.upstreamParamIndex > -1;
  }
  @computed get upstreamParamDescriptor() {
    return this.upstreamDescriptor?.opt[this.upstreamParamIndex];
  }
  @computed get atomDescriptor() {
    return this.getAtomDescriptorByIndex(this.downstreamParamIndex, this.downstreamAtomIndex);
  }
  getAtomDescriptorByIndex(paramIndex: number, atomIndex: number) {
    return this.downstreamDescriptor?.ipt[paramIndex]?.components?.[atomIndex];
  }
  getParamDescriptorByIndex(paramIndex: number) {
    return this.downstreamDescriptor?.ipt[paramIndex];
  }
  atomValueViewer(paramIndex: number, atomIndex: number) {
    if (this.value.length <= paramIndex) return null;
    if (this.value[paramIndex]?.length <= atomIndex) return null;
    return this.value[paramIndex][atomIndex];
  }
  isMatch(paramIndex: number, atomIndex: number) {
    const atomDescriptor = this.getAtomDescriptorByIndex(paramIndex, atomIndex);
    if (!this.upstreamParamDescriptor || !atomDescriptor) return false;
    const { value_type: uType, is_array: uIsArray } = this.upstreamParamDescriptor;
    const { value_type: dType, allow_multi: dIsArray } = atomDescriptor;
    const isMatch = uType === dType && uIsArray === dIsArray;
    return isMatch;
  }
  isActive(paramIndex: number, atomIndex: number) {
    return paramIndex === this.downstreamParamIndex && atomIndex === this.downstreamAtomIndex;
  }
  isError(paramIndex: number, atomIndex: number) {
    return !this.isMatch(paramIndex, atomIndex) && this.isActive(paramIndex, atomIndex) && this.dragging;
  }
  willDrop(paramIndex: number, atomIndex: number) {
    return this.isActive(paramIndex, atomIndex) && this.isMatch(paramIndex, atomIndex) && this.dragging;
  }
  allowDrop(paramIndex: number, atomIndex: number) {
    return !this.isActive(paramIndex, atomIndex) && this.isMatch(paramIndex, atomIndex) && this.dragging;
  }
  @computed get continueDrag() {
    return false;
  }
  @computed get isEdit() {
    return this.editType === EditType.edit;
  }
  private get nodes() {
    return this.root.nodes;
  }
  private get downstreamNode() {
    return this.nodes.get(this.downstreamNodeId);
  }
  @computed get upstreamDescriptor() {
    return this.root.flattenFunctions.find((func) => func.id === this.upstreamBlocId);
  }
  @computed get downstreamDescriptor() {
    return this.root.flattenFunctions.find((func) => func.id === this.downstreamBlocId);
  }
  @computed get upstreamBlocId() {
    return this.nodes.get(this.upstreamNodeId)?.blocId || "";
  }
  @computed get downstreamBlocId() {
    return this.downstreamNode?.blocId || "";
  }
  onExited = () => {
    runInAction(() => {
      this.downstreamNodeId = "";
      this.upstreamNodeId = "";
      this.value = [];
      this.downstreamAtomIndex = -1;
      this.downstreamParamIndex = -1;
      this.editorReadonly = true;
    });
  };
  private get isIdsValid() {
    const connectionIds = this.downstreamNode?.paramIpts?.reduce((acc: string[], param) => {
      const ids = param
        .filter((atom) => atom?.ipt_way === IptWay.Connection && atom.flow_bloc_id)
        .map((component) => component?.flow_bloc_id)
        .filter(isTruthyValue);
      return [...acc, ...ids];
    }, []);
    const upstreamIds = findLogicNodeById(this.root.canvas, this.downstreamNodeId)?.upstream;
    return connectionIds?.every((id) => upstreamIds?.includes(id));
  }
  @action show(line: ConnectionLine, editType: EditType) {
    this.connectionLine = line;
    const { upstream, downstream } = line;
    if (!upstream || !downstream) {
      throw new Error(`downstram or downstram not exist`);
    }
    this.upstreamNodeId = upstream;
    this.downstreamNodeId = downstream;
    this.editType = editType;
    this.setSetterVisible(true);
  }
  close = async () => {
    const isCreate = this.editType === EditType.create;
    if (isCreate) {
      if (this.isIdsValid) {
        this.connectionLine?.destroy();
        this.setSetterVisible(false);
      } else {
        const confirmed = await ConfirmPlugin({
          title: "是否创建关联",
          body: "「下游节点」中使用了「上游节点」的数据，退出前是否为这两个节点创建关联？",
          cancelText: "我再想想",
          confirmText: "创建关联",
        });
        if (confirmed) {
          this.establishConenction();
          this.setSetterVisible(false);
        }
      }
      this.root.request.onNodesChange();
    } else {
      this.setSetterVisible(false);
    }
  };
  @action
  establishConenction() {
    if (!this.connectionLine) {
      throw new Error("不存在line");
    }
    const canvas = this.root.canvas;
    const { upstream, downstream } = this.connectionLine;
    if (!canvas || !downstream || !upstream) {
      throw new Error("不存在canvas/downstram/upsatram");
    }
    this.connectionLine.work();
    this.setSetterVisible(false);
    this.root.request.onNodesChange();
  }
  onDragOver = (e: React.DragEvent, paramIndex: number, atomIndex: number) => {
    e.preventDefault();
    runInAction(() => {
      this.downstreamParamIndex = paramIndex;
      this.downstreamAtomIndex = atomIndex;
    });
    const match = this.isMatch(paramIndex, atomIndex);
    e.dataTransfer.dropEffect = match ? "copy" : "none";
  };
  onLeaveAtomZone = (e: React.DragEvent) => {
    runInAction(() => {
      this.downstreamAtomIndex = -1;
    });
  };
  onLeaveParamZone = () => {
    runInAction(() => {
      this.downstreamParamIndex = -1;
    });
  };
  reset = () => {
    runInAction(() => {
      this.upstreamParamIndex = -1;
      this.downstreamAtomIndex = -1;
      this.downstreamParamIndex = -1;
    });
  };
  onDrop = () => {
    if (this.isActive(this.downstreamParamIndex, this.downstreamAtomIndex)) {
      this.submitConnectValue();
    }
    this.reset();
  };
  onDragStart = (e: React.DragEvent, index: number) => {
    runInAction(() => {
      this.downstreamAtomIndex = -1;
      this.upstreamParamIndex = index;
    });
  };

  @action async removeAtomItem(index: number) {
    if (!Array.isArray(this.atomValue)) {
      console.warn("目标值不是Array!");
      return;
    }
    if (index < 0 || index > this.atomValue.length) return;
    let confirmed = true;
    if (isValidInputValue(this.atomValue[index])) {
      confirmed =
        (await ConfirmPlugin({
          title: "确认删除吗？",
          body: "操作不可撤销。",
        })) ?? false;
    }
    if (!confirmed) return;
    this.atomValue.splice(index, 1);
    ToastPlugin({
      message: "已删除",
    });
  }
  @action addAtomItem() {
    if (!Array.isArray(this.atomValue)) return;
    const emptyValues = this.atomValue.filter((item) => !item);
    if (emptyValues.length) {
      ToastPlugin({
        message: "存在空白的输入项！",
      });
    } else {
      this.atomValue.push("");
    }
  }
  @action updateSelectValue(value: unknown) {
    if (isValidValue(value)) {
      if (Array.isArray(this.atomValue) && !Array.isArray(value)) {
        if (this.atomValue.indexOf(value) > -1) {
          this.atomValue = this.atomValue.filter((item) => item !== value);
        } else {
          this.atomValue.push(value);
        }
      }
      if (!Array.isArray(this.atomValue)) {
        this.atomValue = value;
      }
    }
  }
  @action updateInputFieldValue(value: ValueType, index: number) {
    if (Array.isArray(this.atomValue) && index === -1) {
      console.warn("atom的值是一个Array， 传入的index 不能为-1.");
    }
    if (Array.isArray(this.atomValue) && index >= 0) {
      this.atomValue[index] = value;
    } else {
      this.atomValue = value;
    }
  }
  @action removeListItemValue(index: number) {
    if (Array.isArray(this.atomValue)) {
      this.atomValue.splice(index, 1);
    }
  }
  @action clearAtomValue(paramIndex: number, atomIndex: number) {
    this.downstreamParamIndex = paramIndex;
    this.downstreamAtomIndex = atomIndex;
    this.setValue({
      blank: true,
    });
  }
  @action showEditor(paramIndex: number, atomIndex: number) {
    this.downstreamParamIndex = paramIndex;
    this.downstreamAtomIndex = atomIndex;
    this.editorVisible = true;
    this.editorReadonly = false;
    this.initAtomValue();
  }
  @action initAtomValue() {
    if (this.downstreamParamIndex === -1 || this.downstreamAtomIndex === -1) {
      throw new Error("param或atomindex不能为空");
    }
    const inRange =
      this.value.length > this.downstreamParamIndex &&
      this.value[this.downstreamParamIndex]?.length > this.downstreamAtomIndex;
    const atomValue = inRange
      ? this.value[this.downstreamParamIndex][this.downstreamAtomIndex]?.value
      : this.atomDescriptor?.default_value ?? undefined;
    let realValue = atomValue;

    if (this.isMultiple) {
      realValue = (Array.isArray(realValue) ? realValue : isTruthyValue(realValue) ? [realValue] : []).filter(
        (item) => item !== "",
      );
    }
    this.atomValue = clone(realValue); // TODO
    this.atomValueBackup = clone(this.atomValue);
  }
  @action private closeEditor = () => {
    this.editorVisible = false;
  };
  exitEditor = async () => {
    const isEqual = equals(this.atomValue, this.atomValueBackup);
    if (!isEqual) {
      runInAction(() => {
        this.atomValue = this.atomValueBackup;
      });
      this.closeEditor();
      // if (confirmed) {
      //   this.submitInputValue();
      // }
    } else {
      this.closeEditor();
    }
  };
  disconnect = () => {
    this.removeConnection();
    this.connectionLine?.destroy();
    this.root.request.onNodesChange();
    this.setSetterVisible(false);
  };
  removeConnection() {
    const node = this.nodes.get(this.downstreamNodeId);
    if (!node) return;
    node.setParamIpts(
      this.value.map((item) => {
        return item.filter(
          (inner) =>
            inner?.ipt_way === IptWay.UserIpt ||
            (inner?.ipt_way === IptWay.Connection && inner?.flow_bloc_id !== this.upstreamNodeId),
        );
      }),
    );
  }
  onEditorExited = () => {
    runInAction(() => {
      this.atomValue = undefined;
      this.downstreamParamIndex = -1;
      this.downstreamAtomIndex = -1;
    });
    this.atomValueBackup = undefined;
  };
  @computed get isMultiple() {
    return getIsMultiple(this.atomDescriptor);
  }
  @computed get isJson() {
    return this.atomDescriptor?.formcontrol_type === FormControlType.json;
  }
  @computed private get isSelect() {
    return getIsSelect(this.atomDescriptor);
  }

  @computed get isSingleSelect() {
    if (!this.atomDescriptor) return false;
    const { allow_multi, select_options } = this.atomDescriptor;
    return this.isSelect && !allow_multi && Array.isArray(select_options) && select_options.length > 6;
  }
  @computed get isMultipleSelect() {
    if (!this.atomDescriptor) return false;
    const { allow_multi } = this.atomDescriptor;
    return this.isSelect && allow_multi;
  }
  @computed get isRadio() {
    if (!this.atomDescriptor) return false;
    const { allow_multi, select_options } = this.atomDescriptor;
    return this.isSelect && !allow_multi && Array.isArray(select_options) && select_options.length < 6;
  }
  @computed get isMultipleInput() {
    if (!this.atomDescriptor) return false;
    const { select_options, allow_multi } = this.atomDescriptor;
    return !select_options && allow_multi;
  }
  @computed get isInputField() {
    if (!this.atomDescriptor) return false;
    const { select_options, allow_multi } = this.atomDescriptor;
    return !select_options && !allow_multi;
  }
  @computed get isUpstreamOutputEmpty() {
    return !this.upstreamDescriptor?.opt || this.upstreamDescriptor?.opt.length === 0;
  }
  @action viewValue(paramIndex: number, atomIndex: number) {
    this.downstreamParamIndex = paramIndex;
    this.downstreamAtomIndex = atomIndex;
    this.editorVisible = true;
  }
  setEditorEditable = () => {
    runInAction(() => {
      this.editorReadonly = false;
    });
  };
  @action private setValue(info: Partial<ParamIpt>) {
    for (let i = 0; i <= this.downstreamParamIndex; i++) {
      this.value[i] = i < this.value.length ? this.value[i] || [] : [];
      const atomLength = this.getParamDescriptorByIndex(i)?.components.length || 0;
      for (let k = 0; k < atomLength; k++) {
        this.value[i][k] = this.value[i][k] || atomSetterTemplate;
      }
    }
    this.value[this.downstreamParamIndex][this.downstreamAtomIndex] = {
      blank: false,
      value: "",
      value_type: this.atomDescriptor?.value_type || ParamTypeOptions.string,
      ipt_way: IptWay.UserIpt,
      ...info,
    };
    const node = this.downstreamNode;
    if (node) {
      node.setParamIpts(this.value);
      this.root.request.onNodesChange();
    }
  }
  submitInputValue() {
    this.setValue({
      ipt_way: IptWay.UserIpt,
      value: this.atomValue,
      value_type: this.atomDescriptor?.value_type,
    });
    this.closeEditor();
  }
  submitConnectValue = () => {
    this.setValue({
      ipt_way: IptWay.Connection,
      flow_bloc_id: this.upstreamNodeId,
      key: this.upstreamParamDescriptor?.key || "",
    });
    this.closeEditor();
  };
  isValueValid() {
    if (this.isJson) {
      try {
        if (!isString(this.atomValue)) return false;
        JSON.parse(this.atomValue);
        return true;
      } catch (error) {
        return false;
      }
    }
    if (this.isMultipleInput) {
      if (!Array.isArray(this.atomValue)) return false;
      return this.atomValue.every((item) => item !== "");
    }
    return true;
  }
}
