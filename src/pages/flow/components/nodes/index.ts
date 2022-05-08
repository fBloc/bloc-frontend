import { BlocNodeType } from "@/shared/enums";
import BlocNode from "./BlocNode";
import StartNode from "./StartNode";

export const nodeTypes: Record<BlocNodeType, React.ReactNode> = {
  [BlocNodeType.start]: StartNode,
  [BlocNodeType.job]: BlocNode,
};
