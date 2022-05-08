import React, { useMemo } from "react";
import { Loading, Skeleton, SkeletonProps } from "..";

export type ListProps = {
  loading?: boolean;
  infinite?: boolean; // todo
  emptyNode?: JSX.Element;
  skeleton?: SkeletonProps;
};
const List: React.FC<ListProps> = ({ loading = false, children, emptyNode, skeleton }) => {
  const childrenCount = useMemo(() => React.Children.count(children), [children]);
  const isEmpty = useMemo(() => childrenCount === 0, [childrenCount]);
  if (!loading && isEmpty) return emptyNode || null;
  if (loading && isEmpty) return !!skeleton ? <Skeleton {...skeleton} /> : <Loading />;
  return <>{children}</>;
};

export default List;
