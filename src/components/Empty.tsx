import React, { memo } from "react";
import NoData from "@/assets/images/no-data.svg";
export interface EmptyProps {
  image?: string;
  description?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
const Empty: React.FC<EmptyProps> = memo(({ image, description, className, style }) => {
  const isImageUnset = typeof image === "undefined";
  const useDefaultDescriptionStyle = typeof description === "undefined" || typeof description === "string";
  return (
    <div className={className} style={style}>
      {image && <img src={image} alt="" />}

      {isImageUnset && (
        <p className="tetx-center mb-2">
          <img src={NoData} alt="" className="w-40 mx-auto" />
        </p>
      )}
      <div className={useDefaultDescriptionStyle ? "text-center text-xs text-gray-400 mt-10" : ""}>
        {description || "暂无数据"}
      </div>
    </div>
  );
});

export default Empty;
