import { BLOC_FLOW_HANDLE_ID } from "@/shared/constants";
import { IptWay } from "@/shared/enums";
import { isTruthyValue } from "@/shared/tools";
import {
  BlocNodeItem,
  Connection,
  ConnectionType,
  OperationRecord,
  RemovedConnection,
  TempConnection,
  ParamConnectionEnd,
  FixedConnection,
} from "@/shared/types";
import { uniq } from "lodash-es";
import { getDefaultEditAtom } from "./node";

export function getConnectionId(
  sourceNode: string | null,
  targetNode: string | null,
  sourceParam: string | null = BLOC_FLOW_HANDLE_ID,
  targetParam: string | null = BLOC_FLOW_HANDLE_ID,
) {
  const nodeSepeartor = "-";
  const connectionSeperator = "__";
  if (!sourceNode && !targetNode) {
    //TODO 出现错误
  }
  const _sourceParam = sourceParam ?? BLOC_FLOW_HANDLE_ID;
  const _targetParam = targetParam ?? BLOC_FLOW_HANDLE_ID;
  return `${sourceNode}${nodeSepeartor}${_sourceParam}${connectionSeperator}${targetNode}${nodeSepeartor}${_targetParam}`;
}

export function createConnection(
  sourceNode: string | null,
  targetNode: string | null,
  sourceParam?: string | null,
  targetParam?: string | null,
) {
  return {
    id: getConnectionId(sourceNode, targetNode, sourceParam, targetParam),
    sourceNode,
    targetNode,
    sourceParam,
    targetParam,
  };
}

export function mergeConnections(
  connections: Connection[],
  tempConnection: TempConnection | null,
  removedConnections: RemovedConnection[],
) {
  let fixedConnections = [...connections];
  const fixedIds = fixedConnections.map((item) => item.id);
  if (tempConnection) {
    const { id } = tempConnection;
    if (fixedIds.includes(id)) {
      fixedConnections = fixedConnections.map((connection) => {
        if (connection.id !== id) return connection;
        return {
          ...connection,
          type: ConnectionType.indeterminate,
        };
      });
    } else {
      fixedConnections = [
        ...fixedConnections,
        {
          ...tempConnection,
          type: ConnectionType.indeterminate,
          targetAtomIndex: [],
        },
      ];
    }
  }
  // removedConnections.forEach(({ id, targetAtomIndex }) => {
  //   const connection = fixedConnections.find((item) => item.id === id);
  //   let targetAtoms = connection?.targetAtomIndex ?? [];
  //   targetAtoms = targetAtoms.filter((atom) => atom !== targetAtomIndex);
  //   if (connection && targetAtoms.length === 0) {
  //     fixedConnections = fixedConnections.filter((item) => item.id !== id);
  //   }
  // });
  removedConnections.forEach(({ id }) => {
    fixedConnections = fixedConnections.map((item) => {
      if (item.id === id)
        return {
          ...item,
          type: ConnectionType.indeterminate,
        };
      return item;
    });
  });
  return fixedConnections;
}

export function generateTempVoidConnection(source: ParamConnectionEnd | null, target: ParamConnectionEnd | null) {
  if (!source || !target) return null;
  const { nodeId: sourceNode, param: sourceParam } = source;
  const { nodeId: targetNode, param: targetParam } = target;
  return createConnection(sourceNode, targetNode, sourceParam, targetParam);
}

export function generateRemovedConnections(records: OperationRecord[]) {
  return records.map(({ source, target }) => {
    const { nodeId: sourceNode, param: sourceParam } = source;
    const { nodeId: targetNode, param: targetParam, atomIndex } = target;
    const targetAtomIndex = atomIndex ?? -1;
    if (!targetAtomIndex) {
      // TODO 出现错误，进行提示
    }
    return {
      id: getConnectionId(sourceNode, targetNode, sourceParam, targetParam),
      targetAtomIndex,
    };
  });
}

export function getConnections(nodes: BlocNodeItem[]) {
  return nodes.reduce((acc: Connection[], node) => {
    const flowIpts: Connection[] = node.voidIpt.map((flowId) => {
      return {
        id: getConnectionId(flowId, node.id),
        sourceNode: flowId,
        sourceParam: BLOC_FLOW_HANDLE_ID,
        targetNode: node.id,
        targetParam: BLOC_FLOW_HANDLE_ID,
        targetAtomIndex: [],
        type: ConnectionType.fixed,
      };
    });
    const paramIpts: Connection[] = node.paramIpt.reduce((acc: Connection[], param) => {
      const connections: Connection[] = param.atoms
        .filter(({ unset, iptWay }) => !unset && iptWay === IptWay.Connection)
        .map((atom) => {
          return {
            id: getConnectionId(atom.sourceNode, node.id, atom.sourceParam, param.key),
            sourceNode: atom.sourceNode,
            sourceParam: atom.sourceParam,
            targetNode: node.id,
            targetParam: param.key,
            type: ConnectionType.fixed,
            targetAtomIndex: isTruthyValue(atom.atomIndex) ? [atom.atomIndex] : [],
          };
        });
      return [...acc, ...connections];
    }, []);
    return [...acc, ...flowIpts, ...paramIpts];
  }, []);
}

export function addConnection(
  nodes: BlocNodeItem[],
  { sourceNode, sourceParam, targetNode, targetAtomIndex, targetParam, isVoid }: FixedConnection,
) {
  return nodes.map((node) => {
    if (![sourceNode, targetNode].includes(node.id)) return node;
    const isActualVoid = !targetParam && !sourceParam;
    if (!isVoid && isActualVoid) {
      // TODO 应该设置isvoid
    }
    const _isVoid = isVoid || isActualVoid;
    const _sourceNode = sourceNode || "";
    const _targetNode = targetNode || "";
    if (!_sourceNode) {
      // TODO 存在error
    }
    if (!_targetNode) {
      // TODO 存在error
    }
    if (node.id === sourceNode) {
      return {
        ...node,
        ...(_isVoid
          ? {
              voidOpt: uniq([...node.voidOpt, _targetNode]),
            }
          : {
              paramOpt: node.paramOpt.map((param) => {
                const _targetParam = targetParam || "";
                if (!_targetParam) {
                  //TODO 出错提示
                }
                return param.key === sourceParam
                  ? {
                      ...param,
                      targetList: [
                        ...param.targetList,
                        {
                          nodeId: _targetNode,
                          param: _targetParam,
                          atomIndex: targetAtomIndex ?? -1,
                        },
                      ],
                    }
                  : param;
              }),
            }),
      };
    }
    if (node.id === targetNode) {
      return {
        ...node,
        ...(_isVoid
          ? { voidIpt: uniq([...node.voidIpt, _sourceNode]) }
          : {
              paramIpt: node.paramIpt.map((param) => {
                if (param.key === "user_ids") {
                }
                const atoms = param.atoms.map((atom, atomIndex) => {
                  const _sourceParam = sourceParam || "";
                  if (!_sourceParam) {
                    //TODO 应该是有的，说明出现错误
                  }
                  return atomIndex === targetAtomIndex
                    ? {
                        ...atom,
                        unset: false,
                        iptWay: IptWay.Connection,
                        sourceNode: _sourceNode,
                        sourceParam: _sourceParam,
                      }
                    : atom;
                });
                return param.key === targetParam
                  ? {
                      ...param,
                      atoms,
                    }
                  : param;
              }),
            }),
      };
    }
    return node;
  });
}

export function removeConnection(
  previous: BlocNodeItem[],
  { sourceNode, sourceParam, targetNode, targetAtomIndex, targetParam, isVoid }: FixedConnection,
) {
  return previous.map((node) => {
    if (![sourceNode, targetNode].includes(node.id)) return node;
    if (sourceNode === node.id) {
      return {
        ...node,
        ...(isVoid
          ? {
              voidOpt: node.voidOpt.filter((opt) => opt !== targetNode),
            }
          : {
              paramOpt: node.paramOpt.map((opt) => {
                return opt.key === sourceParam
                  ? {
                      ...opt,
                      targetList: opt.targetList.filter((target) => {
                        const isMatch =
                          target.atomIndex === targetAtomIndex &&
                          target.nodeId === targetNode &&
                          target.param === targetParam;
                        return !isMatch;
                      }),
                    }
                  : opt;
              }),
            }),
      };
    }
    if (targetNode === node.id) {
      return {
        ...node,
        ...(isVoid
          ? {
              voidIpt: node.voidIpt.filter((ipt) => ipt !== sourceNode),
            }
          : {
              paramIpt: node.paramIpt.map((ipt) => {
                const atoms = ipt.atoms.map((atom, atomIndex) => {
                  return atomIndex === targetAtomIndex
                    ? {
                        ...atom,
                        ...getDefaultEditAtom(atom),
                      }
                    : atom;
                });
                return ipt.key === targetParam
                  ? {
                      ...ipt,
                      atoms,
                    }
                  : ipt;
              }),
            }),
      };
    }
    return node;
  });
}
