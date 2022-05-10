import { atom, selector } from "recoil";
import { BlocNodeData } from "@/shared/types";
import { asReactFlowNodes } from "./node";

export enum RunningHistoryOperation {
  RESULT = "result",
  LOG = "log",
}
export type OperationAttrs = { open: boolean; operation: RunningHistoryOperation; nodeId: string };

export const operationAttrs = atom<OperationAttrs>({
  key: "flow/operationAttrs",
  default: {
    open: false,
    operation: RunningHistoryOperation.RESULT,
    nodeId: "",
  },
});
type Attrs = {
  open: boolean;
  nodeData: BlocNodeData | null;
};
export const logAttrs = selector<Attrs>({
  key: "flo/operationAttrs/log",
  get: ({ get }) => {
    const { open, operation, nodeId } = get(operationAttrs);
    const nodes = get(asReactFlowNodes);
    const nodeData = nodes.find((item) => item.id === nodeId)?.data ?? null;
    return {
      open: open && operation === RunningHistoryOperation.LOG,
      nodeData,
    };
  },
});

export const resultAttrs = selector<Attrs>({
  key: "flow/operationAttrs/result",
  get: ({ get }) => {
    const { open, operation, nodeId } = get(operationAttrs);
    const nodes = get(asReactFlowNodes);
    const nodeData = nodes.find((item) => item.id === nodeId)?.data ?? null;
    return {
      open: open && operation === RunningHistoryOperation.RESULT,
      nodeData,
    };
  },
});
