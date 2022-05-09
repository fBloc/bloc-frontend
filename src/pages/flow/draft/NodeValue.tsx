import React from "react";
import { useFormikContext } from "formik";
import { Tooltip } from "@mui/material";
import { StatefulMergedIptParam } from "@/api/flow";
import { TextFallback } from "@/shared/jsxUtils";
import AtomForm from "./atomForm";

type NodeValueProps = {
  param: StatefulMergedIptParam;
};
const NodeValue: React.FC<NodeValueProps> = ({ param }) => {
  const { values, handleChange } = useFormikContext();
  return (
    <>
      {param.atoms.map((atom, atomIndex) => (
        <div key={atomIndex} className="border border-solid border-gray-200 rounded-md mb-4">
          <div
            className="rounded-t-md flex justify-center items-center p-3"
            style={{
              minHeight: "100px",
            }}
          >
            <div className="w-full group">
              <AtomForm
                atomIndex={atomIndex}
                param={param.key}
                value={(values as any)[`${param.key}`][atomIndex].value}
                onChange={handleChange}
                name={`${param.key}[${atomIndex}].value`}
              />
            </div>
          </div>
          <div className="border-t border-solid border-gray-200 flex items-center text-xs py-2 px-3">
            <p className="flex-grow mr-4">{TextFallback(atom.description, "暂无描述")}</p>
            <span className="ml-auto bg-gray-100 rounded py-0.5 px-2 text-gray-500 font-mono">{atom.valueType}</span>
            {atom.isArray && <span className="ml-2 bg-gray-100 rounded py-0.5 px-2 text-gray-500">多</span>}
          </div>
        </div>
      ))}
    </>
  );
};

export default NodeValue;
