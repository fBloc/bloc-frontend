import React from "react";
import EmptyImg from "@/assets/empty.svg";
export type EmptyProps = React.HTMLAttributes<HTMLDivElement> & {
  text?: string;
};
const Empty: React.FC<EmptyProps> = ({ text = "没有数据...", children, ...rest }) => {
  return (
    <div {...rest}>
      <img src={EmptyImg} className="w-20 mb-4 mx-auto" alt="" />
      <p className="text-center text-gray-500">{text}</p>
      {children}
    </div>
  );
};

export default Empty;
