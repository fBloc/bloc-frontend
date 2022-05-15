import React from "react";
import { Handle, Position } from "react-flow-renderer";
import { useTranslation } from "react-i18next";
import BaseNode from "./BaseNode";
import { FaBolt } from "@/components/icons";
import { BlocNodeProps } from "./BlocNode";
import { BLOC_FLOW_HANDLE_ID } from "@/shared/constants";

const StartNode: React.FC<BlocNodeProps> = ({ isConnectable }) => {
  const { t } = useTranslation("flow");
  return (
    <BaseNode className="">
      <Handle
        type="source"
        id={BLOC_FLOW_HANDLE_ID}
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
        }}
        isConnectable={isConnectable}
      />
      {!isConnectable && <span className="absolute left-0 top-0 w-full h-full"></span>}

      <div className="w-64 mx-auto rounded-lg px-4 py-6 flex items-center justify-center border border-solid border-gray-200 bg-white">
        <FaBolt size={12} className="mr-1" />
        {t("node.start")}
      </div>
    </BaseNode>
  );
};
export default StartNode;
