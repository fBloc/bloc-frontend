import React, { useCallback, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import classNames from "classnames";
import { Tooltip } from "@mui/material";
import { Button, Dialog, DialogProps } from "@/components";
import { FaQuestionCircle } from "@/components/icons";
import { TextFallback } from "@/shared/jsxUtils";
import { currentBlocNode } from "@/recoil/flow/node";
import { tempConnectionSource, tempConnectionTarget } from "@/recoil/flow/connections";
import { DEFAULT_CONNECTION_END } from "@/shared/defaults";
import { useAddConnection } from "@/recoil/hooks/useAddConnection";
import { paramAtomsPickerAttrs } from "@/recoil/flow/board";

export type AtomPickerProps = DialogProps;

const AtomPicker: React.FC<AtomPickerProps> = ({ onExited, onExit, ...rest }) => {
  const [index, setIndex] = useState(-1);
  const source = useRecoilValue(tempConnectionSource);
  const target = useRecoilValue(tempConnectionTarget);

  const [attrs, setAttrs] = useRecoilState(paramAtomsPickerAttrs);
  const { param: currentParam } = attrs;
  const currentNode = useRecoilValue(currentBlocNode);
  const { nodeId: sourceNode, param: sourceParam } = useRecoilValue(tempConnectionSource) || DEFAULT_CONNECTION_END;
  const addConnection = useAddConnection();
  const onFullExited = useCallback(() => {
    setIndex(-1);
    onExited?.();
  }, [onExited]);
  const resetAtom = useCallback((index?: number) => {
    //
  }, []);
  const saveConnection = useCallback(
    (isVoid = false) => {
      onExit?.();
      addConnection({
        sourceNode: source?.nodeId || "",
        sourceParam: source?.param,
        targetNode: target?.nodeId || "",
        targetParam: target?.param || "",
        targetAtomIndex: isVoid ? undefined : index,
        isVoid,
      });
    },
    [index, onExit, addConnection, source, target],
  );
  const onAtomIndexChange = useCallback(
    (i = -1) => {
      setIndex(i === index ? -1 : i);
    },
    [index],
  );
  const alreadyConnected = useMemo(() => {
    if (!currentNode || !sourceNode) return false;
    return currentNode.voidIpt.includes(sourceNode);
  }, [currentNode, sourceNode]);
  return (
    <Dialog open={attrs.open} onExited={onFullExited} onExit={onExit} {...rest}>
      <p className="text-lg text-center font-medium">选择一个子项</p>
      <p className="mt-1 text-center text-gray-400">
        目标参数「{currentParam?.key}」有{currentParam?.atoms?.length}个子项
      </p>
      <ul className="mt-8 mb-6 max-h-[80vh] overflow-auto">
        {currentParam?.atoms?.map((atom) => (
          <li
            onClick={() => {
              if (!atom.avaliable) return;
              onAtomIndexChange(atom.atomIndex);
            }}
            key={atom.atomIndex}
            className={classNames(
              "mb-2 py-3 group border border-solid px-2 rounded-md",
              atom.avaliable ? "cursor-default hover:bg-gray-50" : "cursor-not-allowed",
              atom.atomIndex === index ? "border-primary-400" : "border-gray-200",
            )}
          >
            <div
              className={classNames("flex justify-between items-center rounded-lg", {
                "opacity-60": !atom.avaliable,
              })}
            >
              <p className="flex items-center">
                {TextFallback(atom.description, "缺少描述")}
                {atom.message && (
                  <Tooltip title={atom.message} placement="right">
                    <span className="ml-1 cursor-default">
                      <FaQuestionCircle size={12} />
                    </span>
                  </Tooltip>
                )}
              </p>
              <span
                className={classNames(
                  "flex-shrink-0 ml-4 w-4 h-4 rounded-full inline-flex items-center justify-center border-2 border-solid",
                  atom.atomIndex === index ? "border-primary-400 border-4" : "border-gray-200",
                  atom.avaliable ? "group-hover:border-primary-400" : "bg-gray-50",
                )}
              >
                {/* {index === atom.atomIndex && <FaCheck className={classNames("flex-shrink-0 text-white")} size={12} />} */}
              </span>
              {!atom.unset && atom.isTypeMatch && (atom.sourceNode !== sourceNode || atom.sourceParam !== sourceParam) && (
                <div className="flex-shrink-0 ml-3">
                  <span
                    className="w-14 h-6 bg-red-400 justify-center rounded text-xs items-center hidden group-hover:inline-flex group-hover:text-white cursor-default"
                    onClick={() => {
                      resetAtom(atom.atomIndex);
                    }}
                  >
                    清除
                  </span>
                  <span
                    className={classNames(
                      "w-14 h-6 bg-gray-100 rounded text-xs inline-flex justify-center items-center",
                      atom.isTypeMatch ? "group-hover:hidden hover:bg-gray-200" : "",
                    )}
                  >
                    已设置
                  </span>
                </div>
              )}
            </div>
            {/* {atom.message && <p className="mt-1 text-xs text-red-400">{atom.message}</p>} */}
          </li>
        ))}
      </ul>

      <Button
        intent="primary"
        block
        disabled={index < 0}
        onClick={() => {
          saveConnection();
        }}
      >
        保存关联
      </Button>
      <Button
        variant="plain"
        className="mt-3"
        block
        disabled={alreadyConnected}
        onClick={() => {
          saveConnection(true);
        }}
      >
        {alreadyConnected ? "流程已关联" : "仅连接流程，不关联参数"}
      </Button>
    </Dialog>
  );
};

export default AtomPicker;
