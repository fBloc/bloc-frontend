import React, { useCallback, useMemo } from "react";
import { useRecoilCallback, useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { Circle } from "rc-progress";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { EditableText, showConfirm } from "@/components";
import { TabPanel } from "@/components";
import { Button as MdButton, Drawer, DrawerProps, IconButton, Tabs, Tab, Tooltip } from "@mui/material";
import { ArrowConenction as ArrowConnection } from "./atomForm/Connection";
import { atomEditState, AtomKey, currentBlocNodeId, currentReactFlowBlocNode } from "@/recoil/flow/node";
import { nodeViewAttrs } from "@/recoil/flow/board";
import { useQueries } from "@/recoil/hooks/useQueries";
import { FullStateAtom, ParamOpt } from "@/api/flow";
import { FaTimes, FaSnowflake } from "@/components/icons";
import { useUpdateAtomValue } from "@/recoil/hooks/useUpdateAtomValue";
import { operationRecords } from "@/recoil/flow/param";
import NodeValue from "./NodeValue";
import { IptWay, ParamValueType } from "@/shared/enums";
import { valueEqualsUnset } from "@/processors/value";
import { useUpdateBlocNode } from "@/recoil/hooks/useUpdateBlocNode";
export type NodeViewerProps = DrawerProps & {};

function isJson(str?: string) {
  if (!str) return true;
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
const getSchema = (atom: FullStateAtom) => {
  const { valueType, iptWay } = atom;
  let message = "";
  let schema: Yup.BaseSchema = Yup.boolean();
  if (iptWay === IptWay.Connection) {
    return {
      message,
      schema,
    };
  }
  switch (valueType) {
    case ParamValueType.bool:
      const booleanItemSchema = Yup.boolean();
      schema = booleanItemSchema;
      message = "不是有效的数据";
      break;
    case ParamValueType.json:
      const jsonItemSchema = Yup.string().test("isJson", "不是有效的json", isJson);
      schema = jsonItemSchema;
      message = "不是有效的json";
      break;
    case ParamValueType.string:
      const strItemSchema = Yup.string();
      schema = strItemSchema;
      message = "不是字符串";
      break;
    case ParamValueType.int:
      const intItemSchema = Yup.number().integer();
      schema = intItemSchema;
      message = "不是整数";
      break;
    case ParamValueType.float:
      const numItemSchema = Yup.number();
      schema = numItemSchema;
      message = "不是数字";
      break;
  }
  return {
    schema: schema,
    message,
  };
};

const NodeViewer: React.FC<NodeViewerProps> = ({ SlideProps, ...rest }) => {
  const [attrs, setAttrs] = useRecoilState(nodeViewAttrs);
  const detail = useRecoilValue(currentReactFlowBlocNode);
  const data = detail?.data || null;

  const resetRemovedConnections = useResetRecoilState(operationRecords);
  const updateAtom = useUpdateAtomValue();
  const resetTabView = useCallback(() => {
    setAttrs((previous) => ({
      ...previous,
      tabView: "input",
    }));
  }, [setAttrs]);
  const { queryNode, queryTargetAtom } = useQueries();

  const getTargetAtom = useCallback(
    (target: ParamOpt["targetList"][number]) => {
      const { nodeId, param, atomIndex } = target;
      const node = queryNode(nodeId);
      return queryTargetAtom(node || null, param, atomIndex);
    },
    [queryNode, queryTargetAtom],
  );
  const initialValue = useMemo(() => {
    return (
      data?.statefulMergedIpts.reduce((acc, item) => {
        return {
          ...acc,
          [item.key]: item.atoms,
        };
      }, {}) || {}
    );
  }, [data]);
  const updateBlocNode = useUpdateBlocNode();
  const validationSchema = (source: Record<string, FullStateAtom[]>) => {
    const shape = Object.entries(source).reduce((acc, [key]) => {
      const atomValueSchema = Yup.lazy((value: unknown) => {
        switch (typeof value) {
          case "string":
            return Yup.string().nullable();
          case "number":
            return Yup.number().nullable();
          default:
            return Yup.object().shape({
              value: Yup.mixed().test({
                name: "paramItemValueValidation",
                message: "请输入有效的数据",
                test: (_, context) => {
                  const atom = (context as any).from[1].value as FullStateAtom; // 层级关系
                  const v = context.parent.value;
                  const { schema, message } = getSchema(atom);
                  try {
                    schema.required().validateSync(v);
                    return true;
                  } catch (error) {
                    return new Yup.ValidationError(
                      [null, undefined, ""].includes(v) ? "值不能为空" : message,
                      v,
                      context.path,
                    );
                  }
                },
              }),
            });
        }
      });
      return {
        ...acc,
        [key]: Yup.array().of(
          Yup.object().shape({
            isArray: Yup.bool(),
            formType: Yup.string(),
            value: Yup.mixed().when("isArray", {
              is: true,
              then: Yup.array().of(atomValueSchema as any),
              otherwise: Yup.mixed().test({
                name: "paramListValueValidation",
                message: "请输入有效的数据",
                test: (_, context) => {
                  const atom = context.parent as FullStateAtom;
                  const { schema, message } = getSchema(atom);
                  try {
                    schema.validateSync(atom.value);
                    return true;
                  } catch (error) {
                    return new Yup.ValidationError(message, atom.value, context.path);
                  }
                },
              }),
            }),
          }),
        ),
      };
    }, {});
    return Yup.object().shape(shape);
  };
  const onTabViewChange = useCallback(
    (_, tabView: any) => {
      setAttrs((previous) => ({
        ...previous,
        tabView,
      }));
    },
    [setAttrs],
  );
  const currentNodeId = useRecoilValue(currentBlocNodeId);
  const setAtomValue = useRecoilCallback(
    ({ set }) =>
      (key: AtomKey, value: FullStateAtom) => {
        return set<FullStateAtom>(atomEditState(key), value);
      },
    [],
  );
  const onInternalExited = useCallback(
    (node: HTMLElement) => {
      SlideProps?.onExited?.(node);
      resetTabView();
      resetRemovedConnections();
    },
    [SlideProps, resetTabView, resetRemovedConnections],
  );
  const onInternalExit = useCallback(
    (node: HTMLElement) => {
      setAttrs((v) => ({
        ...v,
        open: false,
      }));
      SlideProps?.onExit?.(node);
    },
    [setAttrs, SlideProps],
  );
  return (
    <Drawer
      open={attrs.open}
      anchor="right"
      SlideProps={{
        onExited: onInternalExited,
        onExit: onInternalExit,
      }}
      {...rest}
    >
      <Formik
        enableReinitialize
        initialValues={initialValue}
        validationSchema={validationSchema(initialValue)}
        onSubmit={(values) => {
          const entries = Object.entries(values);
          entries.forEach(([key, value]) => {
            const v = value as FullStateAtom[];
            v.forEach((atom) => {
              if (atom.iptWay === IptWay.UserIpt) {
                const atomKey: AtomKey = `${currentNodeId || ""}_${key}_${atom.atomIndex ?? -1}`;
                setAtomValue(atomKey, {
                  ...atom,
                  unset: valueEqualsUnset(atom), //确认此处逻辑是否可优化
                });
              }
            });
          });
          setAttrs((previous) => ({
            ...previous,
            open: false,
          }));
          updateAtom();
        }}
      >
        {({ dirty, errors }) => {
          return (
            <Form>
              <div className="p-4 w-96 flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex-grow">
                    <Tooltip title="重命名" placement="bottom-start">
                      <EditableText
                        defaultValue={data?.note || data?.function?.name}
                        placeholder="bloc标题"
                        inputProps={{
                          className: "hover:bg-gray-50 rounded !px-2 focus:bg-gray-100",
                        }}
                        onBlur={(e) => {
                          if (currentNodeId) {
                            updateBlocNode(currentNodeId, {
                              note: e.target.value,
                            });
                          }
                        }}
                      />
                    </Tooltip>
                    <p className="text-gray-400 px-2">{data?.function?.description || ""}</p>
                  </div>
                  <IconButton
                    sx={{ ml: 2 }}
                    onClick={async () => {
                      if (dirty) {
                        const confirmed = await showConfirm({
                          title: "有未保存的更改，确认关闭吗？",
                        });
                        if (confirmed) {
                          onInternalExit({} as any);
                        }
                      } else {
                        onInternalExit({} as any);
                      }
                    }}
                  >
                    <FaTimes size={14} />
                  </IconButton>
                </div>
                <Tabs value={attrs.tabView} onChange={onTabViewChange}>
                  <Tab label="输入" value="input" />
                  <Tab label="输出" value="output" />
                </Tabs>
                <TabPanel index="input" value={attrs.tabView}>
                  {data?.statefulMergedIpts?.map((param, paramIndex) => (
                    <div className="mb-6" key={param.key}>
                      <div className="flex items-center mb-2">
                        <div className="relative w-8 h-8">
                          <Circle
                            percent={param.progress * 100}
                            strokeWidth={12}
                            trailWidth={12}
                            trailColor="#eaeaea"
                            className="w-full h-full"
                          />
                          <span className="absolute left-0 top-0 w-full h-full rounded-full inline-flex justify-center items-center">
                            {paramIndex + 1}
                          </span>
                        </div>
                        <div className="ml-2">
                          <p className="flex items-center">
                            {param.description}
                            {param.required && (
                              <Tooltip title="此参数为必填项" placement="right">
                                <span>
                                  <FaSnowflake size={10} className="ml-2 text-red-400" />
                                </span>
                              </Tooltip>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 font-mono">{param.key}</p>
                        </div>
                      </div>

                      <div className="pl-10">
                        <NodeValue param={param} />
                      </div>
                    </div>
                  ))}
                </TabPanel>
                <TabPanel index="output" value={attrs.tabView}>
                  {data?.paramOpts.map((param, paramIndex) => (
                    <div key={param.key} className="mb-6">
                      <div className="flex items-center mb-2">
                        <span className="w-8 h-8 bg-gray-100 rounded-full inline-flex justify-center items-center">
                          {paramIndex + 1}
                        </span>
                        <div className="ml-2 flex-grow flex items-center justify-between">
                          <div>
                            <p>{param.description}</p>
                            <p className="mt-1 text-xs text-gray-400 font-mono">{param.key}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="ml-2 flex justify-between items-center">
                              <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500 font-mono text-xs">
                                {param.valueType}
                              </span>
                              {param.isArray && (
                                <span className="text-xs ml-2 bg-gray-100 rounded py-0.5 px-2 text-gray-500">多</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-10 border-l border-solid border-gray-200">
                        {param.targetList.map((target, targetIndex) => (
                          <div className="mb-6 flex items-center" key={targetIndex}>
                            <div className="w-10 border-t border-solid border-gray-200"></div>
                            <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                            <div className="ml-2 border border-solid border-gray-200 rounded-md flex-grow p-4">
                              <p className="text-xs text-gray-400">
                                {queryNode(target.nodeId)?.note || queryNode(target.nodeId)?.function?.name || "-"}
                              </p>
                              <div className="mt-4 flex">
                                <ArrowConnection />
                                <p className="ml-2 mt-2">{getTargetAtom(target)?.description || "-"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {param.targetList.length === 0 && (
                        <div className="ml-10 h-24 border border-solid border-gray-200 rounded-md flex justify-center items-center text-gray-400">
                          暂未关联至其他节点
                        </div>
                      )}
                    </div>
                  ))}
                </TabPanel>
                <div className="mt-4 flex justify-end items-center px-4 sticky bottom-4 bg-white">
                  <MdButton type="submit" fullWidth variant="outlined">
                    保存
                  </MdButton>
                  {JSON.stringify(errors)}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Drawer>
  );
};
export default NodeViewer;
