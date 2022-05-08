import React, { useCallback } from "react";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { IconButton, Tooltip } from "@mui/material";
import { FaPen, FaTrashAlt } from "@/components/icons";
import { tempConnectionSource } from "@/recoil/flow/connections";
import { useNodeOperations } from "@/recoil/hooks/useNodeOperations";

export type EditNodeOperationsProps = React.HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
  nodeId?: string;
};
const EditNodeOpeations: React.FC<EditNodeOperationsProps> = ({
  selected,
  nodeId = "",
  className,
  children,
  ...rest
}) => {
  const source = useRecoilValue(tempConnectionSource);
  const { removeNode, showNodeViewer } = useNodeOperations();
  const _onRemoveNode = useCallback(() => {
    removeNode(nodeId);
  }, [nodeId, removeNode]);
  const onPreviewNode = useCallback(() => {
    showNodeViewer(nodeId);
  }, [nodeId, showNodeViewer]);
  return (
    <div
      className={classNames(
        "absolute left-full top-0 scale-0 transition-transform pl-1",
        {
          "scale-100": selected && !source,
          "group-hover:scale-100": !source,
        },
        className,
      )}
      {...rest}
    >
      <Tooltip title="移除此节点" placement="right" arrow>
        <IconButton onClick={_onRemoveNode}>
          <FaTrashAlt size={10} className="text-red-400" />
        </IconButton>
      </Tooltip>
      <Tooltip title="编辑节点" placement="right" arrow>
        <IconButton onClick={onPreviewNode}>
          <FaPen size={8} />
        </IconButton>
      </Tooltip>
      {children}
    </div>
  );
};

export default EditNodeOpeations;
