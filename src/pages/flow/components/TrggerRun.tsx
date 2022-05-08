import { FlowDetailT } from "@/api/flow";
import { RunningStatusEnum } from "@/shared/enums";
import { Nullable } from "@/shared/types";
import React, { useMemo } from "react";

const TrggerRun: React.FC<{ flow: Nullable<FlowDetailT> }> = ({ children, flow }) => {
  const hasAccess = useMemo(() => flow?.execute, [flow]);
  const isRunning = useMemo(
    () =>
      flow?.latestRun?.status && [RunningStatusEnum.running, RunningStatusEnum.queue].includes(flow?.latestRun?.status),
    [flow],
  );
  const allowParallelRun = useMemo(() => flow?.allowParallelRun, [flow]);
  const canRun = hasAccess && (!isRunning || (isRunning && allowParallelRun));
  if (!canRun) return null;
  const el = React.isValidElement(children) ? (
    React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props?.onClick?.(e);
      },
    })
  ) : (
    <>children</>
  );
  return <>{el}</>;
};
export default TrggerRun;
