import { EditAtom, FullStateAtom, StatefulMergedIptParam } from "@/api/flow";
import { correctValue } from "@/processors/correctAtomValue";
import { IptWay } from "@/shared/enums";
import { isTruthyValue } from "@/shared/tools";
import { BlocNodeItem, ParamConnectionEnd } from "@/shared/types";
import { uniq } from "lodash-es";

export function flatParamAtoms(ipts: StatefulMergedIptParam[]) {
  return ipts.reduce((acc: FullStateAtom[], param) => {
    return [...acc, ...param.atoms];
  }, []);
}

export function getDefaultEditAtom(
  source: Pick<FullStateAtom, "valueType" | "isArray" | "formType" | "defaultValue">,
): EditAtom {
  return {
    ...source,
    unset: true,
    iptWay: IptWay.UserIpt,
    sourceNode: "",
    sourceParam: "",
    value: correctValue(source),
  };
}

/**
 * 收集不可连接的节点 ID
 */
export function collectConnectableNodeIds(nodes: BlocNodeItem[], source: ParamConnectionEnd | null) {
  if (!source) return [];
  const nodeIds = nodes.map((node) => node.id);
  const disabledNodeIds: string[] = [source.nodeId, "0"].filter(isTruthyValue);
  function collectId(id: string) {
    const node = nodes.find((node) => node.id === id);
    if (node) {
      const idIpts = node.voidIpt;
      const ids = uniq(
        node.paramIpt.reduce((acc: string[], param) => {
          return [
            ...acc,
            ...param.atoms
              .filter((atom) => !atom.unset && atom.iptWay === IptWay.Connection)
              .map((atom) => atom.sourceNode),
          ];
        }, idIpts),
      );
      disabledNodeIds.push(...ids);
      ids.forEach(collectId);
    }
  }
  collectId(source.nodeId || "");
  return nodeIds.filter((id) => !disabledNodeIds.includes(id)); // TODO 逻辑需优化，目前先简单反转
}
