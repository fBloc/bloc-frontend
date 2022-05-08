import { atom, selector } from "recoil";
import { FlowDetailT } from "@/api/flow";
import { tempConnectionSource, tempConnectionTarget } from "./connections";
import { blocNodeList } from "./node";
import { getAtomPickerAttrs } from "@/processors/param";

export type Settings = Partial<FlowDetailT>;

type NodeViewerProps = {
  open: boolean;
  tabView: "input" | "output";
};
export const nodeViewAttrs = atom<NodeViewerProps>({
  key: "nodeViewAttrs",
  default: {
    open: false,
    tabView: "input",
  },
});

export const defaultAtomsPicker = selector({
  key: "defaultEditAtomOptions",
  get: ({ get }) => {
    const source = get(tempConnectionSource);
    const target = get(tempConnectionTarget);
    const nodes = get(blocNodeList);

    return {
      open: false,
      param: getAtomPickerAttrs(nodes, source, target),
    };
  },
});

export const paramAtomsPickerAttrs = atom({
  key: "atomsPicker",
  default: defaultAtomsPicker,
});
