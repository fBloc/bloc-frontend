import React from "react";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { useDrag } from "react-dnd";
import { Tooltip, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaExclamationCircle } from "@/components/icons";
import type { FunctionItem as FunctionItemT } from "@/api/functions";
import { flatFunctionState, functionGroupState } from "@/recoil/functions";

const FunctionItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { item: FunctionItemT }> = ({
  item,
  className,
  ...rest
}) => {
  const { t } = useTranslation("flow");
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
      <p className="mb-2 flex items-center justify-between">
        {item.name}
        {!item.avaliable && (
          <Tooltip title={t("function.mayUnavaliable")} placement="top">
            <span>
              <FaExclamationCircle className="text-yellow-500" />
            </span>
          </Tooltip>
        )}
      </p>
      <p className="text-gray-500 text-xs leading-5">{item.description}</p>
      <Divider sx={{ my: 1, opacity: 0.5 }} />
      <p className="text-xs text-gray-500">
        {t("fucntion.providedBy", {
          provider: item.provider,
        })}
      </p>
    </div>
  );
};
type FunctionsProps = React.HTMLAttributes<HTMLDivElement> & {
  //
};
const Functions: React.FC<FunctionsProps> = ({ children }) => {
  const functionGroups = useRecoilValue(functionGroupState);
  const flatFunctions = useRecoilValue(flatFunctionState);
  const { t } = useTranslation();

  return (
    <div className="absolute left-0 top-0 h-full z-10 p-2">
      <div className="h-full bg-white p-4 rounded-lg shadow-sm w-80 overflow-auto">
        <p className="mb-4 text-xs">
          {t("function.size", {
            groupSize: functionGroups.length,
            functionSize: flatFunctions.length,
          })}
        </p>
        <Divider sx={{ mb: 2 }} />
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
