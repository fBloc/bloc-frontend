import React, { useCallback, useState } from "react";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip, IconButton, Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { FaChevronLeft, FaEllipsisV, FaRegPaperPlane, FaTrashAlt } from "@/components/icons";
import { EditableText, showConfirm } from "@/components";
import { PAGES } from "@/router/pages";
import { flowDetailState } from "@/recoil/flow/flow";
import AutoSave from "./AutoSave";
import { launch, deleteDraft } from "@/api/flow";
import { showToast } from "@/components/toast";
import { useUpdateFlow } from "@/recoil/hooks/useUpdateFlow";
import { useMutation } from "react-query";
import { useSyncFlow } from "@/recoil/hooks/useSave";
import { useCheckFlow } from "@/recoil/hooks/useCheckFlow";

const DraftFlowHeader = () => {
  const flow = useRecoilValue(flowDetailState);
  const navigate = useNavigate();
  const syncFlow = useSyncFlow();
  const deleteDraftMutaion = useMutation(deleteDraft);
  const check = useCheckFlow();
  const { t } = useTranslation();
  const launchFlowMutation = useMutation(launch, {
    onSuccess: ({ isValid, data }) => {
      if (isValid) {
        showToast({
          children: t("launched"),
          autoHideDuration: 1500,
        });
        navigate(`/flow/detail/${data?.originId}`);
      }
    },
  });
  const saveDraftMutation = useMutation(syncFlow);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useCallback(() => {
    setAnchor(null);
  }, []);
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
  }, []);
  return (
    <>
      <div>
        <IconButton onClick={handleClick} sx={{ mr: 2 }}>
          <FaEllipsisV size={12} />
        </IconButton>

        <Button
          color="primary"
          variant="contained"
          disabled={launchFlowMutation.isLoading}
          sx={{
            ml: 2,
          }}
          onClick={async () => {
            // preflight
            const error = check();
            if (error) {
              showToast({
                children: error.message,
                autoHideDuration: 1500,
              });
              return;
            }
            const { isValid } = await saveDraftMutation.mutateAsync(); //  再保存一次
            if (isValid) {
              await launchFlowMutation.mutateAsync(flow?.id || "");
            }
          }}
        >
          <FaRegPaperPlane className="inline-block mr-2" size={12} />
          {t("launch")}
        </Button>
      </div>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <MenuItem
          disabled={deleteDraftMutaion.isLoading}
          onClick={async () => {
            const confirmed = await showConfirm({
              title: t("deleteDraftConfirm"),
            });
            if (!confirmed) {
              handleClose();
              return;
            }
            const { isValid } = await deleteDraftMutaion.mutateAsync(flow?.originId || "");
            handleClose();
            if (isValid) {
              showToast({
                children: t("deleted"),
                autoHideDuration: 1500,
              });
              navigate(PAGES.flowList);
            }
          }}
        >
          <ListItemIcon>
            <FaTrashAlt size={14} />
          </ListItemIcon>
          <ListItemText>{t("deleteDraft")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
type HeaderBarProps = React.HTMLAttributes<HTMLDivElement> & {};
const HeaderBar: React.FC<HeaderBarProps> = ({ children, className, ...rest }) => {
  const flow = useRecoilValue(flowDetailState);
  const setInfo = useUpdateFlow();
  return (
    <div className={classNames("px-3 py-2 bg-white shadow flex items-center justify-between", className)} {...rest}>
      <div className="flex-1 flex items-center">
        <Tooltip title="返回">
          <Link to={PAGES.flowList}>
            <IconButton>
              <FaChevronLeft size={14} />
            </IconButton>
          </Link>
        </Tooltip>
        <div className="w-60">
          <Tooltip title="重命名" placement="left-start">
            <EditableText
              key={flow?.name}
              className="ml-4 font-medium"
              defaultValue={flow?.name}
              placeholder="flow名称"
              inputProps={{
                maxLength: __MAX_FLOW_NAME_LENGTH__,
                className: "hover:bg-gray-50 focus:bg-gray-100 !px-2 rounded",
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value !== flow?.name) {
                  setInfo({
                    name: e.target.value || "未命名项目",
                  });
                }
              }}
            />
          </Tooltip>
        </div>
        <AutoSave className="ml-8" />
      </div>
      <DraftFlowHeader />
      {children}
    </div>
  );
};
export default HeaderBar;
