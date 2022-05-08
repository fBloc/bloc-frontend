import React, { memo, useEffect, useRef } from "react";
import { useCallback } from "react";
import Skeleton from "../skeleton";

const defaultFallback = (
  <Skeleton
    paragraph={{
      rows: 3,
      className: "rounded",
    }}
  />
);
const LazyComponent: React.FC<{
  fallback?: React.ReactNode;
  open: boolean;
  content: React.LazyExoticComponent<React.FC> | (() => JSX.Element);
}> = memo(({ fallback = defaultFallback, children, open, content: Content }) => {
  const fresh = useRef(true);
  useEffect(() => {
    if (open) {
      fresh.current = false;
    }
  }, [open]);

  const generateH = useCallback(() => {
    const Component = Content as any;
    return Component?.$$typeof ? <Content /> : Component();
  }, [Content]);
  return <React.Suspense fallback={fallback}>{(open || !fresh.current) && generateH()}</React.Suspense>;
});

export default LazyComponent;
