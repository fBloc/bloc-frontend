import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import classNames from "classnames";
import { Tooltip } from "@mui/material";
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
import { Pagination, Skeleton } from "@/components";
import Empty from "@/components/empty";
import { diffSeconds, readableTime } from "@/shared/time";

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
    <Tooltip title={`${getTriggerLabel(type)}触发`}>
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
                  版本
                  <Tooltip title="数字越大，代表版本越新" arrow>
                    <span>
                      <FaQuestionCircle className="ml-1" />
                    </span>
                  </Tooltip>
                </span>
              </th>
              <th className="w-[180px] py-4 px-2">触发时间</th>
              <th className="w-[180px] py-4">开始运行时间</th>
              <th className="w-[180px] py-4">结束运行时间</th>
              <th className="w-[100px] py-4">历时</th>
              <th className="w-[160px] py-4">状态</th>
              <th className="w-[160px] py-4">触发方式</th>
              <th className="px-2 py-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {!loading && records.items.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <Empty text="没有运行历史" className="mt-40" />
                </td>
              </tr>
            )}
            {records.items?.map((item) => (
              <tr key={item.id} className="border-b border-solid group hover:bg-gray-100">
                <td className="py-4 px-2">{item.flow_version}</td>
                <td className="py-4 px-2">{readableTime(item.trigger_time)}</td>
                <td className="py-4">{readableTime(item.start_time)}</td>
                <td className="py-4">{readableTime(item.end_time)}</td>
                <td className="py-4">{diffSeconds(item.trigger_time, item.end_time)}</td>

                <td className="py-4">
                  <span className="flex items-center">
                    {getRunningIcon(item.status, classNames(getRunningStateClass(item.status), "mr-2"))}
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
                <td className="px-2 py-4 text-primary-400 hover:underline">
                  <Link to={`/flow/history/${item.id}?id=${item.flow_origin_id}`} target="_blank">
                    查看
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination
        className="mt-4 justify-end"
        total={records.total}
        disabled={loading}
        pageSize={pageSize}
        currentPage={pageNum}
        onCurrentPageChange={(pageNum) => {
          document.documentElement.scrollTop = 0;
          fetchNext(pageNum);
        }}
      />
    </div>
  );
};

export default FlowHistory;
