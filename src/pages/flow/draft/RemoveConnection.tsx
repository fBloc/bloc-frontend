import React, { useCallback, useMemo } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { Dialog, Box, Button, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaTimes } from "@/components/icons";
import { useQueries } from "@/recoil/hooks/useQueries";
import { isTruthyValue } from "@/shared/tools";
import { beingRemovedConnectionAttrs } from "@/recoil/flow/connections";

import { useRemoveConnection } from "@/recoil/hooks/useRemoveConnection";
import { TextFallback } from "@/shared/jsxUtils";
import { showToast } from "@/components/toast";

const RemoveConnection = () => {
  const [attrs, setAttrs] = useRecoilState(beingRemovedConnectionAttrs);
  const resetAttrs = useResetRecoilState(beingRemovedConnectionAttrs);
  const { queryNode, queryTargetAtom } = useQueries();
  const removeConnection = useRemoveConnection();
  const { t } = useTranslation();
  const targeAtoms = useMemo(() => {
    if (!attrs.connection) return [];
    const { targetNode, targetParam, targetAtomIndex = [] } = attrs.connection;
    const node = queryNode(targetNode);
    if (!node) {
      // TODO error
      return [];
    }
    return targetAtomIndex.map((item) => queryTargetAtom(node, targetParam, item)).filter(isTruthyValue);
  }, [attrs, queryNode, queryTargetAtom]);
  const onInternalExit = useCallback(() => {
    setAttrs((previous) => ({
      ...previous,
      open: false,
    }));
  }, [setAttrs]);
  return (
    <Dialog
      open={attrs.open}
      maxWidth="xs"
      fullWidth
      TransitionProps={{
        onExit: onInternalExit,
        onExited: resetAttrs,
      }}
    >
      <Box sx={{ p: 2 }}>
        <p className="flex justify-end">
          <IconButton onClick={onInternalExit}>
            <FaTimes size={14} />
          </IconButton>
        </p>
        <p className="text-lg text-center font-medium">{t("disconnectItem")}</p>
        <p className="mt-1 text-center text-gray-400">
          {t("connctedSize", {
            size: attrs.connection?.targetAtomIndex?.length,
          })}
        </p>
        <div className="mt-6 ">
          {targeAtoms.map((atom) => (
            <p
              key={atom.atomIndex}
              className="mt-3 p-3 border border-solid rounded-md flex items-center justify-between group"
            >
              {TextFallback(atom.description, t("noDescription"))}
              <Button
                className="ml-2"
                size="small"
                onClick={() => {
                  if (!attrs.connection) return;
                  removeConnection({
                    ...attrs.connection,
                    targetAtomIndex: atom.atomIndex,
                  });
                  setAttrs((previous) => ({
                    ...previous,
                    open: false,
                  }));
                  showToast({
                    children: t("disconnected"),
                    autoHideDuration: 1500,
                  });
                }}
              >
                {t("disconnect")}
              </Button>
            </p>
          ))}
        </div>
      </Box>
    </Dialog>
  );
};

export default RemoveConnection;
