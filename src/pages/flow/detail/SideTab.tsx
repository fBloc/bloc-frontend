import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { flowDetailState } from "@/recoil/flow/flow";
import { Tooltip, TooltipProps } from "@mui/material";
export type SideTabProps<T> = {
  items?: {
    tooltip: Omit<TooltipProps, "children">;
    value: T;
    disabled?: boolean;
    label?: React.ReactNode;
  }[];
  value?: T;
  activeClass?: string;
};
export function SideTab<T extends string | number>({
  value,
  items = [],
  activeClass = "text-primary-400",
  ...rest
}: SideTabProps<T>) {
  const flow = useRecoilValue(flowDetailState);
  return (
    <ul className="bg-white w-14 shadow-sm py-3 flex-shrink-0">
      {items.map((item) => (
        <Tooltip {...item.tooltip} key={item.value} {...rest}>
          <li className={classNames(" hover:text-primary-400", value === item.value ? activeClass : "")}>
            <Link
              className="w-full flex justify-center items-center h-14"
              to={`/flow/detail/${flow?.originId}?tab=${item.value}`}
            >
              {item.label}
            </Link>
          </li>
        </Tooltip>
      ))}
    </ul>
  );
}
