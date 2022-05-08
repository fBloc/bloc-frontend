import { BlocRunRecord } from "@/api/flow";
import { BlocNodeData } from "@/shared/types";
import { atom } from "recoil";
export type RecordDialogStateProps = { open: boolean } & { nodeData: BlocNodeData | null };

export const recordAttrs = atom<RecordDialogStateProps>({
  key: "recordDialogAttrs",
  default: {
    open: false,
    nodeData: null,
  },
});

export const recordLogAttrs = atom<{ record: BlocRunRecord | null; open: boolean; node: BlocNodeData | null }>({
  key: "recordLogAttrs",
  default: {
    open: false,
    record: null,
    node: null,
  },
});
