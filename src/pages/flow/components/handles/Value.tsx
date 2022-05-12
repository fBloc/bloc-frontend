import React from "react";
import { Link } from "react-router-dom";
import { IconButton, Tooltip, Divider } from "@mui/material";
import classNames from "classnames";
import { FaAngleDoubleRight, FaExclamationCircle, FaSitemap, FaKeyboard } from "@/components/icons";
import { TextFallback } from "@/shared/jsxUtils";
import { ResultPreview, StatefulMergedIptParam } from "@/api/flow";
import { IptWay } from "@/shared/enums";

const Value: React.FC<{
  isLoading: boolean;
  value?: string;
  valueResult?: ResultPreview;
  canViewAll: boolean;
  className?: string;
}> = ({ isLoading, valueResult, canViewAll, value, className }) => {
  return (
    <div className={classNames("p-2 bg-gray-500 text-white text-sm flex items-center justify-between", className)}>
      {isLoading ? (
        "loading..."
      ) : (
        <>
          <span className="overflow-hidden">
            <span className="block w-full text-ellipsis overflow-hidden whitespace-nowrap">
              {TextFallback(value ?? valueResult?.brief, "数据为空")}
            </span>
          </span>
          {canViewAll && valueResult?.object_storage_key && (
            <Tooltip title="查看全部数据">
              <Link className="ml-2" to={`/result/${valueResult.object_storage_key}`} target="_blank">
                <IconButton size="small" color="inherit">
                  <FaAngleDoubleRight size={12} />
                </IconButton>
              </Link>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};

export default Value;

const getIptWayText = (iptway: IptWay) => {
  const texts = {
    [IptWay.UserIpt]: "用户输入",
    [IptWay.Connection]: "上游传入",
  };
  return texts[iptway];
};

const TargetValue: React.FC<{
  result?: ResultPreview[];
  isLoading: boolean;
  param: StatefulMergedIptParam;
}> = ({ result, isLoading, param }) => {
  return (
    <>
      <p className="text-sm">{TextFallback(param.description, "缺少描述")}</p>
      <p className="text-gray-400 text-xs">{param.key}</p>
      <Divider sx={{ mt: 1 }} />
      <ul>
        {param.atoms?.map((atom, i) => (
          <li key={atom.atomIndex} className="mt-2">
            <div className="text-xs text-gray-400">
              {i + 1}. {TextFallback(atom.description, "缺少描述")}
            </div>
            <div className="mt-1 bg-gray-100 rounded">
              {!atom.unset && (
                <Value
                  isLoading={isLoading}
                  canViewAll={atom.iptWay === IptWay.Connection}
                  valueResult={result?.[i]}
                  value={result?.[i]?.brief ?? atom.readableValue}
                  className="rounded-t"
                />
              )}

              <p className="text-xs p-1 text-gray-400 flex items-center justify-between">
                {atom.unset ? (
                  <>
                    <FaExclamationCircle size={12} className="text-warning mr-1" />
                    未设置
                  </>
                ) : (
                  <>
                    {atom.iptWay === IptWay.Connection ? <FaSitemap /> : <FaKeyboard />}
                    <span className="mr-auto ml-1">{`由 ${getIptWayText(atom.iptWay)}`}</span>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export { TargetValue };
