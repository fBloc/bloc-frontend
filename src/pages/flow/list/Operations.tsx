import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useMutation } from "react-query";
import classNames from "classnames";
import { Button } from "@/components";
import { Tooltip } from "@mui/material";
import { FaEdit, FaHistory, FaPlayCircle, FaProjectDiagram } from "@/components/icons";
import { flowDetailState, flowGetters } from "@/recoil/flow/flow";
import { triggerRun } from "@/api/flow";
import { showToast } from "@/components/toast";

const LaunchedFlowOperations: React.FC = ({ children }) => {
  const flow = useRecoilValue(flowDetailState);
  const getters = useRecoilValue(flowGetters);
  const navigate = useNavigate();
  const triggerRunMutation = useMutation(triggerRun, {
    onSuccess: ({ isValid, data }) => {
      if (isValid) {
        showToast({
          children: "已触发运行",
          autoHideDuration: 1500,
        });
        navigate(`/flow/history/${flow?.latestRun?.id}?id=${flow?.originId}`);
      }
    },
  });
  return (
    <>
      <Tooltip title="运行历史" placement="bottom">
        <Link to={`/flow/detail/${flow?.originId || ""}?tab=history`} target="_blank">
          <Button variant="text">
            <FaHistory size={14} />
          </Button>
        </Link>
      </Tooltip>
      <Tooltip title="Flow详情" placement="bottom">
        <Link to={`/flow/detail/${flow?.originId || ""}`} target="_blank">
          <Button variant="text">
            <FaProjectDiagram size={16} />
          </Button>
        </Link>
      </Tooltip>
      <Tooltip title={getters.canExcute ? "立即运行" : getters.disableExcuteReason} placement="bottom-end">
        <Button
          onClick={async () => {
            if (getters.canExcute) {
              await triggerRunMutation.mutateAsync({
                flowOriginId: flow?.originId || "",
              });
            }
          }}
          className={classNames("rounded flex justify-center items-center ", {
            "text-primary-400": getters.canExcute,
            "text-gray-400 cursor-not-allowed": !getters.canExcute,
          })}
          variant="text"
        >
          <FaPlayCircle size={16} />
        </Button>
      </Tooltip>
      {children}
    </>
  );
};
export default LaunchedFlowOperations;

export const DraftFlowOperations: React.FC = ({ children }) => {
  const flow = useRecoilValue(flowDetailState);
  return (
    <>
      <Tooltip title="继续编辑">
        <Link to={`/flow/draft/${flow?.originId || ""}`} target="_blank">
          <Button variant="text">
            <FaEdit size={16} />
          </Button>
        </Link>
      </Tooltip>
      {children}
    </>
  );
};
