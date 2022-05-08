import { FullStateAtom, ParamOpt } from "@/api/flow";
import { BlocNodeItem, ParamConnectionEnd } from "@/shared/types";

export function collectParams(
  nodes: BlocNodeItem[],
  filter: (source: ParamOpt) => (atom: FullStateAtom) => boolean,
  sourceParam: ParamOpt | null,
) {
  if (!sourceParam) return [];
  return nodes.reduce((acc: string[], node) => {
    const ids = node.paramIpt.reduce((acc: string[], param) => {
      const validAtoms = param.atoms.filter(filter(sourceParam));
      return [...acc, ...(validAtoms.length > 0 ? [param.key] : [])];
    }, []);
    return [...acc, ...ids];
  }, []);
}

/**
 * 收集一定可以连接的params
 */
export function collectAbsoluteConnctableParams(nodes: BlocNodeItem[], source: ParamOpt | null) {
  return collectParams(
    nodes,
    ({ valueType, isArray }) =>
      (atom) => {
        return valueType === atom.valueType && isArray === atom.isArray && atom.unset;
      },
    source,
  );
}
/**
 * 收集或许可以连接的params
 */
export function collectMayConnectableParams(nodes: BlocNodeItem[], source: ParamOpt | null) {
  return collectParams(
    nodes,
    ({ valueType, isArray }) =>
      (atom) => {
        return valueType === atom.valueType && isArray === atom.isArray;
      },
    source,
  );
}
const findNode = (nodes: BlocNodeItem[], id: string | null = "") => {
  return nodes.find((node) => node.id === id);
};
export function getAtomPickerAttrs(
  nodes: BlocNodeItem[],
  source: ParamConnectionEnd | null,
  target: ParamConnectionEnd | null,
) {
  const sourceParam = findNode(nodes, source?.nodeId)?.paramOpt.find((param) => param.key === source?.param);
  const targetParam = findNode(nodes, target?.nodeId)?.paramIpt.find((param) => param.key === target?.param);

  if (!sourceParam || !targetParam) {
    return null;
  }
  return {
    ...targetParam,
    atoms: targetParam.atoms.map((atom) => {
      const isTypeMatch = sourceParam.valueType === atom.valueType;
      const isUnset = atom.unset;
      const isBothArray = sourceParam.isArray === atom.isArray;
      const canTypeMatch = isTypeMatch && isBothArray;
      return {
        ...atom,
        avaliable: canTypeMatch && isUnset,
        isTypeMatch: canTypeMatch,
        message: canTypeMatch ? "" : "数据类型不一致，无法关联",
      };
    }),
  };
}
