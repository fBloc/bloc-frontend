import React, { memo } from "react";
import Empty, { EmptyProps } from "./Empty";

type ListItemsProps = {
  /**
   * 强制显示空状态
   */
  forceEmpty?: boolean;
  emptyProps?: EmptyProps;
  loading?: boolean;
  skeleton?: React.ReactElement;
} & React.HTMLProps<HTMLDivElement>;

const ListItems: React.FC<ListItemsProps> = memo(({ children, emptyProps, forceEmpty, loading, skeleton, ...rest }) => {
  const isItemsEmpty = React.Children.count(children) === 0;
  const isEmpty = isItemsEmpty || forceEmpty;
  if (loading && skeleton) return <>{skeleton}</>;
  return isEmpty ? <Empty {...emptyProps} /> : <div {...rest}>{children}</div>;
});

export default ListItems;
