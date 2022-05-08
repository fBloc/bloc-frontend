import React from "react";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { useDrag } from "react-dnd";
import type { FunctionItem as FunctionItemT } from "@/api/functions";
import { flatFunctionState, functionGroupState } from "@/recoil/functions";
import { connectableNodeIds } from "@/recoil/flow/node";

const FunctionItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { item: FunctionItemT }> = ({
  item,
  className,
  ...rest
}) => {
  const [, dragRef] = useDrag(
    () => ({
      type: "functionItem",
      item: {
        id: item.id,
      },
    }),
    [],
  );
  return (
    <div
      ref={dragRef}
      className={classNames("mb-2 p-3 bg-gray-50 rounded select-none hover:bg-gray-100 translate-x-0", className)}
      {...rest}
    >
      <p className="mb-2">{item.name}</p>
      <p className="text-gray-500 text-xs leading-5">{item.description}</p>
    </div>
  );
};
type FunctionsProps = React.HTMLAttributes<HTMLDivElement> & {
  //
};
const Functions: React.FC<FunctionsProps> = ({ children }) => {
  const functionGroups = useRecoilValue(functionGroupState);
  const flatFunctions = useRecoilValue(flatFunctionState);
  return (
    <div className="absolute left-0 top-0 h-full z-10 p-2">
      <div className="h-full bg-white p-4 rounded-lg shadow-sm w-80 overflow-auto">
        <p className="mb-4 text-xs">
          共{functionGroups.length}分组，{flatFunctions.length}个函数
        </p>
        <div>
          {functionGroups.map((group, index) => (
            <div key={index} className="mb-10">
              <p className="text-xs mb-2">{group.groupName}</p>
              {group.functions.map((fn) => (
                <FunctionItem key={fn.id} item={fn} />
              ))}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Functions;
