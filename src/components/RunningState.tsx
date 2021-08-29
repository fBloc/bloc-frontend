import React, { memo } from "react";
import { Icon, Colors } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { RunningEnum } from "@/common";

const RunningState: React.FC<{ record?: { status: string; time: string } }> = memo(({ record }) => {
  if (!record) return null;
  let node: React.ReactNode = null;
  switch (record.status) {
    case RunningEnum.created:
      node = <Icon icon="play" color={Colors.GREEN4} size={12} />;
      break;
    case RunningEnum.queue:
      node = <Icon icon="git-commit" color={Colors.ORANGE4} size={12} />;
      break;
    case RunningEnum.running:
      node = <Icon icon="walk" color={Colors.FOREST4} size={12} />;
      break;
    case RunningEnum.success:
      node = <Icon icon="tick-circle" color={Colors.GREEN4} size={12} />;
      break;
    case RunningEnum.failed:
      node = <Icon icon="warning-sign" color={Colors.RED4} size={12} />;
  }
  return (
    <Tooltip2 content={record.status} placement="bottom">
      <span className="mr-2 w-4 h-4 flex justify-center items-center rounded-full">{node}</span>
    </Tooltip2>
  );
});

export default RunningState;
