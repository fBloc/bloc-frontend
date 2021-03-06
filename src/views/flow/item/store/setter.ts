import { action, makeObservable, observable, runInAction, computed } from "mobx";
import { clone, equals } from "ramda";
import { EditType, isString, isTruthyValue, isValidInputValue, Nullable, ParamTypeOptions } from "@/common";
import { findLogicNodeById } from "@/fabric/tools";
import { IptWay, ValueType, ParamIpt, atomSetterTemplate } from "@/api/flow";
import { FormControlType, IAtom, SelectOption } from "@/api/bloc";
import { ConnectionLine, isBlocNode } from "@/fabric/objects";
import { ConfirmPlugin, ToastPlugin } from "@/components/plugins";
import { FlowItemStore as RootStore } from "./index";

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
export class Params {
  @observable setterVisible = false;
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
    return false; // TODO
  }
  constructor(private root: RootStore) {
    makeObservable(this);
  }
  @action setSetterVisible(visible: boolean) {
    this.setterVisible = visible;
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
  private get downstreamNode() {
    const node = findLogicNodeById(this.root.canvas, this.downstreamNodeId);
    return isBlocNode(node) ? node : undefined;
  }
  private get upstreamNode() {
    const node = findLogicNodeById(this.root.canvas, this.upstreamNodeId);
    return isBlocNode(node) ? node : undefined;
  }
  @computed get upstreamDescriptor() {
    return this.root.flattenFunctions.find((func) => func.id === this.upstreamBlocId);
  }
  @computed get downstreamDescriptor() {
    return this.root.flattenFunctions.find((func) => func.id === this.downstreamBlocId);
  }
  @computed get upstreamBlocId() {
    return this.upstreamNode?.blocId;
  }
  @computed get downstreamBlocId() {
    return this.downstreamNode?.blocId;
  }
  private get isIdsValid() {
    const connectionIds = this.downstreamNode?.paramIpts?.reduce((acc: string[], param) => {
      const ids = param
        .filter((atom) => atom?.ipt_way === IptWay.Connection && atom.flow_function_id)
        .map((component) => component?.flow_function_id)
        .filter(isTruthyValue);
      return [...acc, ...ids];
    }, []);
    const upstreamIds = findLogicNodeById(this.root.canvas, this.downstreamNodeId)?.upstream;
    return connectionIds?.every((id) => upstreamIds?.includes(id));
  }
  @action show(upstream: string, downstream: string, editType: EditType) {
    this.upstreamNodeId = upstream;
    this.downstreamNodeId = downstream;
    this.editType = editType;
    this.setSetterVisible(true);
  }
  close = async () => {
    const isCreate = this.editType === EditType.create;
    if (isCreate) {
      if (this.isIdsValid) {
        // this.root.bridge.cancelConnection();
        this.setSetterVisible(false);
      } else {
        const confirmed = await ConfirmPlugin({
          title: "??????????????????",
          body: "????????????????????????????????????????????????????????????????????????????????????????????????????????????",
          cancelText: "????????????",
          confirmText: "????????????",
        });
        if (confirmed) {
          // this.root.bridge.submitConnection();
          this.setSetterVisible(false);
        }
      }
    } else {
      this.setSetterVisible(false);
    }
  };
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
      console.warn("???????????????Array!");
      return;
    }
    if (index < 0 || index > this.atomValue.length) return;
    let confirmed = true;
    if (isValidInputValue(this.atomValue[index])) {
      confirmed =
        (await ConfirmPlugin({
          title: "??????????????????",
          body: "?????????????????????",
        })) ?? false;
    }
    if (!confirmed) return;
    this.atomValue.splice(index, 1);
    ToastPlugin({
      message: "?????????",
    });
  }
  @action addAtomItem() {
    if (!Array.isArray(this.atomValue)) return;
    const emptyValues = this.atomValue.filter((item) => !item);
    if (emptyValues.length) {
      ToastPlugin({
        message: "???????????????????????????",
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
      console.warn("atom???????????????Array??? ?????????index ?????????-1.");
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
  }
  @action initAtomValue() {
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
    // this.root.request.updateNodes();
    this.setSetterVisible(false);
  };
  removeConnection() {
    const bloc = this.root.nodes.get(this.downstreamNodeId);
    if (!bloc) return;
    bloc.paramIpts = this.value.map((item) => {
      return item.filter(
        (inner) =>
          inner?.ipt_way === IptWay.UserIpt ||
          (inner?.ipt_way === IptWay.Connection && inner?.flow_function_id !== this.upstreamNodeId),
      );
    });
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
      flow_function_id: "",
      key: "",
      ...info,
    };
    const target = findLogicNodeById(this.root.canvas, this.downstreamNodeId);
    if (isBlocNode(target)) {
      target.setParamIpts(this.value);
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
      flow_function_id: this.upstreamNodeId,
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
