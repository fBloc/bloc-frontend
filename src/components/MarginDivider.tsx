import React, { memo } from "react";
import { Divider, IDividerProps } from "@blueprintjs/core";

type Directions = Record<"mt" | "mb" | "ml" | "mr" | "mx" | "my", number | string>;
export type MarginDividerProps = Partial<Directions> & IDividerProps;

const MarginDivider: React.FC<MarginDividerProps> = memo((props) => {
  const { mt, mr, mb, ml, mx, my, style = {} } = props;
  const marginStyle: React.CSSProperties = {};
  if (mx) {
    marginStyle.marginLeft = mx;
    marginStyle.marginRight = mx;
  }
  if (my) {
    marginStyle.marginTop = my;
    marginStyle.marginBottom = my;
  }
  if (mt) {
    marginStyle.marginTop = mt;
  }
  if (mr) {
    marginStyle.marginRight = mr;
  }
  if (mb) {
    marginStyle.marginBottom = mb;
  }
  if (ml) {
    marginStyle.marginLeft = ml;
  }
  return (
    <Divider
      style={{
        ...style,
        ...marginStyle,
      }}
    />
  );
});

export default MarginDivider;
