import React, { useMemo } from "react";
import classNames from "classnames";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import { Tooltip, IconButton } from "@mui/material";
import { FaChevronLeft } from "@/components/icons";
import { getRunningIcon, getRunningStateClass, getRunningStateText } from "@/shared/enums";
import CurrentState from "./CurrentState";
import { readableTime } from "@/shared/time";
import { flowDetailState } from "@/recoil/flow/flow";
import { PAGES } from "@/router/pages";

const LaunchedFlowHeader = () => {
  const flow = useRecoilValue(flowDetailState);
  const latestRun = useMemo(() => flow?.latestRun, [flow]);

  return (
    <>
      <div
        className={classNames(
          "text-center flex-1 flex-shrink-0 overflow-hidden",
          getRunningStateClass(latestRun?.status, {}, "mt-0.5"),
        )}
      >
        <p className={classNames("flex items-center justify-center")}>
          {getRunningIcon(flow?.latestRun?.status)}
          <span className="ml-2">{getRunningStateText(latestRun?.status)}</span>
        </p>
        {flow?.latestRun?.error_msg && (
          <Tooltip title={flow?.latestRun?.error_msg || ""}>
            <p className="text-xs mt-1 text-ellipsis overflow-hidden whitespace-nowrap text-gray-400">
              {flow?.latestRun?.error_msg}
            </p>
          </Tooltip>
        )}
      </div>
      <div className="flex-shrink-0 flex-1 rounded-lg flex items-center justify-end text-gray-400">
        <CurrentState />
      </div>
    </>
  );
};
type HeaderBarProps = React.HTMLAttributes<HTMLDivElement> & {};
const HeaderBar: React.FC<HeaderBarProps> = ({ children, className, ...rest }) => {
  const flow = useRecoilValue(flowDetailState);
  const [query] = useSearchParams();
  const originId = query.get("id");
  const node = query.get("node");
  const { t } = useTranslation("flow");

  const target = useMemo(() => {
    if (node) return PAGES.flowList;
    return originId ? `/flow/detail/${originId}?tab=history` : PAGES.flowList;
  }, [originId, node]);
  return (
    <div className={className}>
      <div
        className={classNames("px-3 py-2 flex items-center justify-between bg-white shadow-sm rounded-lg")}
        {...rest}
      >
        <div className="flex-1 flex items-center flex-shrink-0">
          <Tooltip
            title={t("goback", {
              ns: "common",
            })}
          >
            <Link to={target}>
              <IconButton>
                <FaChevronLeft size={14} />
              </IconButton>
            </Link>
          </Tooltip>
          <div className="ml-4">
            <p className="font-medium">{flow?.name}</p>
            <p className="mt-1 text-xs text-gray-400">
              {t("run.triggeredTime", {
                time: readableTime(flow?.latestRun?.trigger_time),
              })}
            </p>
          </div>
        </div>
        <LaunchedFlowHeader />
        {children}
      </div>
      {flow?.newest === false && (
        <div className="bg-yellow-100 tetx-center p-2 text-yellow-600 text-center">{t("run.oldVersionFlow")}</div>
      )}
    </div>
  );
};
export default HeaderBar;
