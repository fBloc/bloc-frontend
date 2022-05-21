import React, { useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import classNames from "classnames";
import { useQuery } from "react-query";
import { FaCheckCircle, FaCircleNotch, FaDotCircle } from "@/components/icons";
import { getRunningInfo } from "@/api/bloc";
import { useTranslation } from "react-i18next";

const RunningInfo: React.FC<{ recordId: string }> = ({ recordId }) => {
  const [finished, setFinished] = useState(false);
  const { data, isFetching } = useQuery(["getRunningInfo", recordId], () => getRunningInfo(recordId), {
    enabled: !!recordId,
    refetchInterval: finished ? undefined : 2000,
    onSuccess: (data) => {
      setFinished(data.data?.is_finished ?? true);
    },
  });
  const info = useMemo(() => data?.data, [data]);
  const current = useMemo(() => info?.progress_milestone_index ?? -1, [info]);
  const length = useMemo(() => info?.progress_milestones?.length ?? 0, [info]);
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex">
      {length > 0 && (
        <div className="border border-solid p-4 rounded-lg mr-6 w-72 h-96 overflow-auto">
          {info?.progress_milestones?.map((item, index) => (
            <div key={index} className="flex items-center mb-3">
              <span className="mr-2">
                {(index < current || finished) && <FaCheckCircle className="text-green-400" />}
                {index === current && !finished && <FaCircleNotch className="animate-spin text-warning" />}
                {index > current && <FaDotCircle className="text-gray-300" />}
                {/* {index === current && !finished && (
                  <Tooltip title={`${info.progress}%`}>
                    <span className="w-3 h-3 border-2 border-gray-200 rounded-full inline-flex relative">
                      <CircularProgress
                        size={12}
                        variant="determinate"
                        value={info.progress}
                        className="!text-warning w-full h-full absolute -left-0.5 -top-0.5"
                        thickness={8}
                      />
                    </span>
                  </Tooltip>
                )} */}
              </span>
              {index === current && !finished && (
                <span className="mr-2 text-warning">[{info.progress.toFixed(2)}%]</span>
              )}
              <span className={classNames(index > current ? "opacity-40" : "")}>{item}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex-grow h-96 overflow-auto">
        {info?.progress_msg?.map((item, index) => (
          <p className="mb-3" key={index}>
            {item}
          </p>
        ))}
        {info?.progress_msg?.length === 0 && <p className="pt-10 text-center text-gray-400">{t("noData")}</p>}
        {isFetching && <CircularProgress sx={{ ml: 1 }} color="info" size={14} />}
      </div>
    </div>
  );
};

export default RunningInfo;
