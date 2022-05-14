import React, { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Menu, MenuItem, IconButton, Tooltip, Divider } from "@mui/material";
import { FaHome, FaPlayCircle, FaEdit, FaEllipsisV } from "@/components/icons";
import { showToast } from "@/components/toast";
import { PAGES } from "@/router/pages";
import Info from "../components/Info";
import { flowDetailState, flowGetters } from "@/recoil/flow/flow";
import { copyAsDraft, triggerRun } from "@/api/flow";

type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  tab?: string;
  loading?: boolean;
};

const Header: React.FC<HeaderProps> = ({ className, tab, loading = false, ...rest }) => {
  const flow = useRecoilValue(flowDetailState);
  const [infoVisible, setInfoVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const showInfo = useCallback(() => {
    setInfoVisible(true);
  }, []);
  const hideInfo = useCallback(() => {
    setInfoVisible(false);
  }, []);
  const excuteMutation = useMutation(triggerRun, {
    onSuccess: ({ isValid, data }) => {
      if (isValid) {
        showToast({
          children: t("triggered"),
          autoHideDuration: 1500,
        });
        navigate(`/flow/history/${data?.flow_run_record_id}?id=${flow?.originId}`);
      }
    },
  });
  const getters = useRecoilValue(flowGetters);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setTarget(e.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setTarget(null);
  }, []);
  const visible = useMemo(() => target !== null, [target]);
  const createDraftFlowMutation = useMutation(copyAsDraft);

  return (
    <>
      <header className={classNames("pr-2 bg-white shadow-sm", className)} {...rest}>
        <div className={classNames("flex items-center h-14", loading ? "invisible" : "")}>
          <div className="flex-1 flex items-center">
            <Link to={PAGES.flowList}>
              <div className="w-14 h-14 flex justify-center items-center bg-gray-800 text-white">
                <Tooltip title={t("toHomePage")}>
                  <span>
                    <FaHome size={18} />
                  </span>
                </Tooltip>
              </div>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">{flow?.name}</div>
          <div className={classNames("flex-1 flex justify-end items-center", tab === "flow" ? "" : "invisible")}>
            <Tooltip title={t("more")}>
              <IconButton onClick={handleClick} sx={{ mr: 2 }}>
                <FaEllipsisV size={14} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={target}
              open={visible}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <MenuItem
                onClick={async () => {
                  const { isValid, data } = await createDraftFlowMutation.mutateAsync(flow?.originId || "");
                  if (isValid) {
                    handleClose();
                  }
                  if (data?.originId) {
                    navigate(`/flow/draft/${data.originId}`);
                  }
                }}
              >
                {t("duplicate")}
              </MenuItem>
              <Divider />
              <MenuItem onClick={showInfo}>{t("basicInfo")}</MenuItem>
            </Menu>
            <Tooltip title={t("edit")} placement="bottom">
              <Link to={`/flow/draft/${flow?.originId || ""}`}>
                <IconButton>
                  <FaEdit size={18} />
                </IconButton>
              </Link>
            </Tooltip>

            <Tooltip title={getters.canExcute ? t("run") : getters.disableExcuteReason} placement="bottom">
              <IconButton
                sx={{
                  ml: 2,
                }}
                className={classNames({
                  "!text-primary-400": getters.canExcute,
                  "text-gray-400 cursor-not-allowed": !getters.canExcute,
                })}
                onClick={async () => {
                  if (getters.canExcute) {
                    await excuteMutation.mutateAsync({
                      flowOriginId: flow?.originId || "",
                    });
                  }
                }}
              >
                <FaPlayCircle size={18} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </header>

      <Info
        open={infoVisible}
        TransitionProps={{
          onExit: hideInfo,
        }}
      />
    </>
  );
};

export default Header;
