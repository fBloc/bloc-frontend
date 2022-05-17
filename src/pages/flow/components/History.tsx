import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Tooltip, Box, Pagination } from "@mui/material";
import { FlowRunningStatus, getLatestRunningRecords } from "@/api/flow";
import {
  getRunningIcon,
  getRunningStateClass,
  getRunningStateText,
  getTriggerLabel,
  getTriggerValue,
  TriggerTypes,
} from "@/shared/enums";
import { FaUserCircle, FaBolt, FaClock, FaQuestionCircle } from "@/components/icons";
import { Skeleton } from "@/components";
import Empty from "@/components/empty";
import { readableDuration, readableTime } from "@/shared/time";

const icons = {
  [TriggerTypes.crontab]: <FaClock size={11} />,
  [TriggerTypes.key]: <FaBolt size={11} />,
  [TriggerTypes.user]: <FaUserCircle size={11} />,
};
const TriggerType: React.FC<{ triggerKey: string; triggerUser: string; type: TriggerTypes }> = ({
  triggerKey,
  triggerUser,
  type,
}) => {
  return (
    <Tooltip title={`${getTriggerLabel(type)}`}>
      <span
        className={classNames(
          "mt-1 text-xs mr-2 px-2 py-1 rounded font-medium inline-flex items-center bg-gray-100 text-gray-500",
        )}
      >
        <span className="mr-1">{icons[type]}</span>
        <span className="max-w-[100px] overflow-ellipsis overflow-hidden whitespace-nowrap">
          {getTriggerValue({
            type,
            crontab: "crontab",
            user: triggerUser,
            key: triggerKey,
          })}
        </span>
      </span>
    </Tooltip>
  );
};
const pageSize = 20;

const FlowHistory = () => {
  const { t } = useTranslation("flow");
  const { originId } = useParams<"originId">();
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<{ items: FlowRunningStatus[]; total: number }>({
    items: [],
    total: 0,
  });
  const alive = useRef(false);
  const fetchNext = useCallback(
    async (pageNum: number) => {
      if (!originId) return;
      setLoading(true);
      const { data, isValid } = await getLatestRunningRecords({
        flowOriginId: originId,
        offset: (pageNum - 1) * pageSize,
        limit: pageSize,
      });
      if (alive.current) {
        setLoading(false);
        if (isValid) {
          setRecords(() => {
            return {
              items: data?.items || [],
              total: data?.total || 0,
            };
          });
          setPageNum(pageNum);
        }
      }
    },
    [originId, setRecords],
  );

  useEffect(() => {
    alive.current = true;
    fetchNext(1);
    return () => {
      alive.current = false;
    };
  }, [fetchNext]);
  return (
    <div className="max-w-7xl mx-auto px-4 pb-4">
      {loading ? (
        <Skeleton
          paragraph={{
            rows: 10,
            className: "mt-4 h-20",
            fixedWidth: true,
          }}
        />
      ) : (
        <table className="mt-4 text-left w-full">
          <thead className="sticky top-0 bg-[#fafafa]">
            <tr className="text-gray-400">
              <th className="w-[80px] py-4 px-2">
                <span className="inline-flex items-center">
                  {t("version", {
                    ns: "common",
                  })}
                  <Tooltip title={t("run.versionDescription")} arrow>
                    <span>
                      <FaQuestionCircle className="ml-1" />
                    </span>
                  </Tooltip>
                </span>
              </th>
              <th className="w-[180px] py-4 px-2">{t("run.triggerAt")}</th>
              <th className="w-[180px] py-4">{t("run.startRunAt")}</th>
              <th className="w-[180px] py-4">{t("run.endRunAt")}</th>
              <th className="w-[180px] py-4">{t("run.duration")}</th>
              <th className="w-[160px] py-4">
                {t("status", {
                  ns: "common",
                })}
              </th>
              <th className="w-[160px] py-4">{t("run.triggerMethod")}</th>
              <th className="px-2 py-4">
                {t("operations", {
                  ns: "common",
                })}
              </th>
            </tr>
          </thead>
          <tbody>
            {!loading && records.items.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <Empty text={t("run.noRunningRecords")} className="mt-40" />
                </td>
              </tr>
            )}
            {records.items?.map((item) => (
              <tr key={item.id} className="border-b border-solid group hover:bg-gray-100">
                <td className="py-4 px-2">{item.flow_version}</td>
                <td className="py-4 px-2">{readableTime(item.trigger_time)}</td>
                <td className="py-4">{readableTime(item.start_time)}</td>
                <td className="py-4">{readableTime(item.end_time)}</td>
                <td className="py-4">{readableDuration(item.trigger_time, item.end_time)}</td>

                <td className="py-4">
                  <span className="flex items-center">
                    {getRunningIcon(item.status, {
                      className: classNames(getRunningStateClass(item.status), "mr-2"),
                    })}
                    {getRunningStateText(item.status)}
                  </span>
                </td>
                <td className="py-4 whitespace-nowrap">
                  <TriggerType
                    triggerKey={item.trigger_key}
                    triggerUser={item.trigger_user_name}
                    type={item.trigger_type}
                  />
                </td>
                <td className="px-2 py-4">
                  <Box
                    sx={{
                      color: (theme) => theme.palette.primary.main,
                    }}
                    className="hover:underline inline-block"
                  >
                    <Link to={`/flow/history/${item.id}?id=${item.flow_origin_id}`} target="_blank">
                      {t("view", {
                        ns: "common",
                      })}
                    </Link>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        count={Math.ceil(records.total / 20)}
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        onChange={(_, pageNum) => {
          fetchNext(pageNum);
        }}
      />
    </div>
  );
};

export default FlowHistory;
