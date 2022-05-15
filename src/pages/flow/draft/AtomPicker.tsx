import React, { useCallback, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import classNames from "classnames";
import { Tooltip, Dialog, DialogProps, Box, Button, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle, FaTimes } from "@/components/icons";
import { TextFallback } from "@/shared/jsxUtils";
import { AtomKey, currentBlocNode } from "@/recoil/flow/node";
import { tempConnectionSource, tempConnectionTarget } from "@/recoil/flow/connections";
import { useAddConnection } from "@/recoil/hooks/useAddConnection";
import { paramAtomsPickerAttrs } from "@/recoil/flow/board";
import { useSetAtomValue } from "@/recoil/hooks/useSetAtomValue";
import { operationRecords } from "@/recoil/flow/param";
import { FullStateAtom } from "@/api/flow";
import { useUpdateAtomValue } from "@/recoil/hooks/useUpdateAtomValue";
import { useTempConnection } from "@/recoil/hooks/useTempConnection";
import { useClearAllAtoms } from "@/recoil/hooks/useClearAtom";

export type AtomPickerProps = DialogProps;

const AtomPicker: React.FC<Omit<AtomPickerProps, "open">> = ({ TransitionProps, ...rest }) => {
  const { onExit, onExited, ...restTransitionProps } = TransitionProps || {};
  const [index, setIndex] = useState(-1);
  const source = useRecoilValue(tempConnectionSource);
  const target = useRecoilValue(tempConnectionTarget);
  const resetSource = useResetRecoilState(tempConnectionSource);
  const resetTarget = useResetRecoilState(tempConnectionTarget);
  const { tempAddConnection, tempRemoveConnection } = useTempConnection();
  const updateAtom = useUpdateAtomValue();
  const clearAtoms = useClearAllAtoms();
  const resetRecords = useResetRecoilState(operationRecords);
  const [attrs, setAttrs] = useRecoilState(paramAtomsPickerAttrs);
  const { param: currentParam, open } = attrs;
  const currentNode = useRecoilValue(currentBlocNode);
  const addConnection = useAddConnection();
  const { t } = useTranslation("flow");
  const onInternalExit = useCallback(
    (e: HTMLElement) => {
      onExit?.(e);
      setAttrs((previous) => ({
        ...previous,
        open: false,
      }));
    },
    [setAttrs, onExit],
  );
  const onInternalExited = useCallback(
    (e: HTMLElement) => {
      onExited?.(e);
      setIndex(-1);
      clearAtoms();
      resetRecords();
      resetSource();
      resetTarget();
    },
    [clearAtoms, resetRecords, onExited, resetSource, resetTarget],
  );

  const setAtomValue = useSetAtomValue();
  const resetAtom = useCallback(
    (atom: FullStateAtom) => {
      const { sourceNode, sourceParam, nodeId, parentParam, atomIndex } = atom;
      const key = `${nodeId}_${parentParam}_${atomIndex}` as AtomKey;
      setAtomValue(key, "", true);
      tempRemoveConnection({
        source: {
          nodeId: sourceNode,
          param: sourceParam,
        },
        target: {
          nodeId: nodeId || "",
          param: parentParam,
          atomIndex,
        },
      });
      setAttrs((previous) => {
        return {
          ...previous,
          param: {
            ...previous.param,
            atoms:
              previous.param?.atoms.map((_atom) => {
                return _atom.atomIndex === atom.atomIndex
                  ? {
                      ..._atom,
                      unset: true,
                      avaliable: _atom.isTypeMatch,
                    }
                  : _atom;
              }) || [],
          },
        } as any;
      });
    },
    [setAtomValue, setAttrs, tempRemoveConnection],
  );
  const onAtomIndexChange = useCallback(
    (i = -1) => {
      setIndex(i === index ? -1 : i);
    },
    [index],
  );
  const alreadyConnected = useMemo(() => {
    const sourceNode = source?.nodeId || "";
    if (!currentNode || !sourceNode) return false;
    return currentNode.voidIpt.includes(sourceNode);
  }, [currentNode, source]);
  return (
    <Dialog
      open={open}
      TransitionProps={{
        onExit: onInternalExit,
        onExited: onInternalExited,
        ...restTransitionProps,
      }}
      {...rest}
    >
      <Box
        sx={{
          p: 2,
        }}
      >
        <p
          className="flex justify-end"
          onClick={(e) => {
            onInternalExit(e.currentTarget);
          }}
        >
          <IconButton>
            <FaTimes size={14} />
          </IconButton>
        </p>
        <p className="text-lg text-center font-medium">{t("params.selectAnItem")}</p>
        <p className="mt-1 text-center text-gray-400">
          {t("params.subItems", {
            key: currentParam?.key,
            atomSize: currentParam?.atoms?.length,
          })}
        </p>
        <ul className="mt-8 mb-6 max-h-[80vh] overflow-auto">
          {currentParam?.atoms?.map((atom, _atomIndex) => (
            <li
              onClick={() => {
                if (!atom.avaliable) return;
                onAtomIndexChange(_atomIndex);
              }}
              key={_atomIndex}
              className={classNames(
                "mb-2 py-3 group border border-solid px-2 rounded-md",
                atom.avaliable ? "cursor-default hover:bg-gray-50" : "cursor-not-allowed bg-gray-50",
                atom.atomIndex === index ? "border-primary-400" : "border-gray-200",
              )}
            >
              <div className={classNames("flex justify-between items-center rounded-lg")}>
                <p className="flex items-center flex-grow justify-between">
                  {TextFallback(
                    atom.description,
                    t("noDescription", {
                      ns: "common",
                    }),
                  )}
                  {atom.message && (
                    <Tooltip title={atom.message} placement="left">
                      <span className="ml-1 cursor-default">
                        <FaQuestionCircle size={12} />
                      </span>
                    </Tooltip>
                  )}
                </p>
                {atom.avaliable && (
                  <span
                    className={classNames(
                      "flex-shrink-0 ml-4 w-4 h-4 rounded-full inline-flex items-center justify-center border-2 border-solid",
                      _atomIndex === index ? "border-primary-400 border-4" : "border-gray-200",
                      atom.avaliable ? "group-hover:border-primary-400" : "bg-gray-50",
                    )}
                  ></span>
                )}
                {!atom.unset && atom.isTypeMatch && (
                  <div className="flex-shrink-0 ml-3">
                    <span
                      className="w-14 h-6 bg-red-400 justify-center rounded text-xs items-center hidden group-hover:inline-flex group-hover:text-white cursor-default"
                      onClick={() => {
                        resetAtom(atom);
                      }}
                    >
                      {t("clear")}
                    </span>
                    <span
                      className={classNames(
                        "w-14 h-6 bg-gray-200 rounded text-xs inline-flex justify-center items-center",
                        atom.isTypeMatch ? "group-hover:hidden" : "",
                      )}
                    >
                      {t("alreadySet")}
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        <Button
          color="primary"
          variant="contained"
          fullWidth
          disabled={index < 0}
          onClick={async (e) => {
            tempAddConnection({
              source: {
                nodeId: source?.nodeId || "",
                param: source?.param || "",
              },
              target: {
                nodeId: target?.nodeId || "",
                param: target?.param || "",
                atomIndex: index,
              },
            });

            setTimeout(() => {
              updateAtom();
              onInternalExit(e.currentTarget);
            });
            // updateAtom()
          }}
        >
          保存关联
        </Button>

        {!alreadyConnected && (
          <Button
            color="info"
            fullWidth
            variant="outlined"
            sx={{
              mt: 2,
            }}
            disabled={alreadyConnected}
            onClick={(e) => {
              addConnection({
                sourceNode: source?.nodeId || "",
                sourceParam: source?.param || "",
                targetNode: target?.nodeId || "",
                targetParam: target?.param || "",
                isVoid: true,
              });
              onInternalExit(e.currentTarget);
            }}
          >
            仅连接流程，不关联参数
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default AtomPicker;
