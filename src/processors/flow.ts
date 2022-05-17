import { EditAtom, FlowDetailT, FullStateAtom, ParamOpt, StatefulMergedIptParam } from "@/api/flow";
import { FunctionItem, IptParam } from "@/api/functions";
import { correctValue } from "@/processors/correctAtomValue";
import { DEFAULT_POSITION } from "@/shared/defaults";
import { FormControlType, IptWay, MergedIptParamStatus } from "@/shared/enums";
import { isTruthyValue } from "@/shared/tools";
import { BlocNodeItem, ParamConnectionEnd } from "@/shared/types";
import { getDefaultEditAtom } from "./node";
import { isPlainObject } from "lodash-es";
// TODO 类型名称
type FullEditAtom = EditAtom & { atomIndex: number; targetNode: string; targetParam: string };

function collectAtoms(flow: FlowDetailT | null, functions: FunctionItem[]) {
  if (!flow || !flow.nodeToBlocMap) return [];
  const sourceData = flow.nodeToBlocMap;
  const result: FullEditAtom[] = [];
  for (const id in sourceData) {
    const node = sourceData[id];
    const fn = functions.find((fn) => fn.id === node.functionId);
    const mergedAtoms = node.paramIpts.reduce((acc: FullEditAtom[], param, paramIndex) => {
      const fnParam = fn?.ipt?.[paramIndex]?.key || "";
      if (!fnParam) {
        //TODO 出错提示
      }
      const atoms = param.map((atom, atomIndex) => ({
        ...atom,
        atomIndex,
        targetNode: id,
        targetParam: fnParam,
      }));
      return [...acc, ...atoms];
    }, []);
    result.push(...mergedAtoms);
  }
  return result;
}

export function extractNodes(flow: FlowDetailT | null, functions: FunctionItem[]) {
  if (!flow) return [];
  const result: BlocNodeItem[] = [];
  const sourceData = flow.nodeToBlocMap || {};
  const runningInfo = flow.latestRunRecordsMap || {};
  const allAtoms = collectAtoms(flow, functions);
  let startNodeExisted = false;
  for (const id in sourceData) {
    const node = sourceData[id];
    if (id === "0") {
      startNodeExisted = true;
    }
    const { left = 0, top = 0 } = node.position || DEFAULT_POSITION;
    const fn = functions.find((fn) => fn.id === node.functionId);
    if (!fn) {
      // TODO 提示不应为空 非0时
    }
    result.push({
      id,
      note: node.note,
      function: fn || null,
      position: {
        left,
        top,
      },
      paramIpt: mergeIpts(node.paramIpts, fn || null, id),
      paramOpt: mergeOpts(allAtoms, fn || null, id),
      voidIpt: node.sourceNodeIds,
      voidOpt: node.targetNodeIds,
      latestRunningInfo: runningInfo[id] || null,
    });
  }
  if (!startNodeExisted) {
    result.push({
      id: "0",
      note: "",
      function: null,
      position: {
        left: 400,
        top: 200,
      },
      paramIpt: [],
      paramOpt: [],
      voidIpt: [],
      voidOpt: [],
      latestRunningInfo: null,
    });
  }
  return result;
}

export const getDefaultEditParam = (ipt: IptParam): EditAtom[] => {
  return ipt.atoms.map(getDefaultEditAtom);
};

function getReadableValue(value: unknown, atom: Omit<FullStateAtom, "readableValue">) {
  const { selectOptions, formType, iptWay } = atom;
  if (iptWay === IptWay.Connection || !isTruthyValue(value)) return "";
  const isValueArray = Array.isArray(value);

  if (formType === FormControlType.select) {
    const getLabel = (value: unknown) =>
      (selectOptions?.find((option) => option.value === value)?.label || "").toString();
    if (Array.isArray(value)) {
      return value.map(getLabel).join(",");
    }
    return getLabel(value);
  }
  const toString = (value: unknown) => {
    if (isPlainObject(value) && (value as any).value) {
      return (value as any).value || "";
    }
    return (value as any)?.toString() || "";
  };
  return isValueArray ? value.map(toString).join(",") : (value as string | number).toString();
}

export function mergeIpts(paramIpts: EditAtom[][], fn: FunctionItem | null, id: string): StatefulMergedIptParam[] {
  return (
    fn?.ipt.map((param, paramIndex) => {
      const currentParam = paramIpts[paramIndex] || getDefaultEditParam(param);
      return {
        ...param,
        atoms: param.atoms.map((atom, atomIndex) => {
          const currentAtom = currentParam[atomIndex];
          const _value = correctValue({
            ...currentAtom,
            ...atom,
          });
          const _atom: FullStateAtom = {
            ...currentAtom,
            ...atom,
            value: _value,
            readableValue: getReadableValue(_value, {
              ...currentAtom,
              ...atom,
            }),
            nodeId: id,
            parentParam: param.key,
            atomIndex,
          };
          return {
            ..._atom,
          };
        }),
        status: MergedIptParamStatus.avaliable,
        index: paramIndex,
        progress: 1, // 之后会统一处理，此处只是默认值
      };
    }) || []
  );
}

function mergeOpts(allAtoms: FullEditAtom[], fn: FunctionItem | null, id: string): ParamOpt[] {
  return (
    fn?.opt.map(({ valueType, isArray, key, description }) => {
      const targetList = allAtoms
        .filter(({ sourceNode, sourceParam, unset, iptWay }) => {
          const isMatch = !unset && iptWay === IptWay.Connection && sourceNode === id && sourceParam === key;
          return isMatch;
        })
        .map((atom) => {
          return {
            nodeId: atom.targetNode,
            param: atom.targetParam,
            atomIndex: atom.atomIndex,
          };
        });
      return {
        valueType,
        isArray,
        key,
        description,
        nodeId: id,
        targetList,
      };
    }) || []
  );
}

export function makeParamsStateful(
  nodes: BlocNodeItem[],
  {
    mayConnectableParams,
    absConnectableParams,
    connectableNodeIds,
    sourceParam,
    flow,
  }: {
    mayConnectableParams: string[];
    absConnectableParams: string[];
    connectableNodeIds: string[];
    sourceParam: ParamConnectionEnd | null;
    flow: FlowDetailT | null;
  },
) {
  return nodes.map((node) => {
    return {
      ...node,
      paramIpt: node.paramIpt.map((param) => {
        let status = MergedIptParamStatus.unavaliable;
        const key = `${node.id}_${param.key}`;
        if (mayConnectableParams.includes(key)) {
          status = MergedIptParamStatus.indeterminate;
        }
        if (absConnectableParams.includes(key)) {
          status = MergedIptParamStatus.avaliable;
        }
        if (!connectableNodeIds.includes(node.id)) {
          status = MergedIptParamStatus.unavaliable;
        }
        if (param.atoms.length === 1) {
          // 当源param与只有一个atom的param的值相同时，，则无需提示可以被替换
          const { unset, iptWay, sourceNode: _sourceNode, sourceParam: _sourceParam } = param.atoms[0];
          if (
            !unset &&
            iptWay === IptWay.Connection &&
            _sourceNode === sourceParam?.nodeId &&
            _sourceParam === sourceParam.param
          ) {
            status = MergedIptParamStatus.unavaliable;
          }
        }
        const setedLength = param.atoms.filter((atom) => !atom.unset).length;
        const all = param.atoms.length;
        const allSet = setedLength === all;

        if (!sourceParam) {
          status = allSet ? MergedIptParamStatus.avaliable : status;
        }
        if (setedLength === 0 && all > 0 && flow?.isDraft === false) {
          status = MergedIptParamStatus.unset;
        }

        return {
          ...param,
          atoms: param.atoms.map((atom) => ({
            ...atom,
            readableValue: getReadableValue(atom.value, atom),
          })),
          status:
            flow?.isDraft === false && (flow.latestRun === null || node.latestRunningInfo === null)
              ? MergedIptParamStatus.unavaliable
              : status, // 非草稿且节点未运行（flow未运行或节点未运行），则无需状态。
          progress: setedLength / all,
        };
      }),
    };
  });
}
