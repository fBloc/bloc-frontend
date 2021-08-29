import React, { useMemo } from "react";
import classNames, { Value } from "classnames";

type SimpleType = string | number | boolean;
export interface TabProps extends React.HTMLAttributes<HTMLUListElement> {
  options: {
    label: React.ReactNode;
    value: string | number;
  }[];
  value: string | number;
  onValueChange?: (v: SimpleType) => void;
}

const Tab: React.FC<TabProps> = ({ options, className, style, value, onValueChange }) => {
  const index = useMemo(() => options?.findIndex((item) => item.value === value), [options, value]);
  if (!options) return null;
  return (
    <ul className={classNames("flex bg-gray-50 rounded-lg cursor-default relative", className)} style={style}>
      {options.map((item) => (
        <li
          onClick={() => {
            onValueChange?.(item.value);
          }}
          className={classNames("py-3 flex-grow text-center relative z-10  rounded-lg", {
            "text-blue-400 font-medium": value === item.value,
            "active:bg-gray-100": value !== item.value,
          })}
          key={item.value}
        >
          {item.label}
        </li>
      ))}
      <li
        className="absolute top-0 bottom-0 rounded p-1 transition-transform"
        style={{
          width: `${(1 / options.length) * 100}%`,
          transform: `translateX(${index * 100}%)`,
        }}
      >
        <div className="bg-white h-full rounded-md shadow"></div>
      </li>
    </ul>
  );
};

export default Tab;
