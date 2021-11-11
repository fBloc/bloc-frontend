import React, { memo } from "react";
import { Icon, Colors } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { RunningEnum, runningStateTexts } from "@/common";

const RunningState: React.FC<{ status: RunningEnum; disableTooltip?: boolean }> = memo(
  ({ status, disableTooltip = false }) => {
    if (!status) return null;
    let node: React.ReactNode = null;
    switch (status) {
      case RunningEnum.created:
        node = <Icon icon="confirm" color={Colors.ORANGE4} />;
        break;
      case RunningEnum.queue:
        node = <Icon icon="one-to-one" color={Colors.ORANGE4} />;
        break;
      case RunningEnum.running:
        node = <Icon icon="selection" color={Colors.ORANGE4} />;
        break;
      case RunningEnum.success:
        node = <Icon icon="tick-circle" color={Colors.GREEN4} />;
        break;
      case RunningEnum.failed:
        node = <Icon icon="error" color={Colors.RED4} />;
        break;
      case RunningEnum.userCancel:
        node = <Icon icon="blocked-person" color={Colors.RED4} />;
        break;
      case RunningEnum.systemCancel:
        node = <Icon icon="ban-circle" color={Colors.RED4} />;
    }
    return (
      <Tooltip2 content={runningStateTexts[status]} placement="bottom" disabled={disableTooltip}>
        {node}
      </Tooltip2>
    );
  },
);

export default RunningState;
