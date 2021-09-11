import React, { memo, useEffect, useRef } from "react";

const LazyComponent: React.FC<{ fallback: NonNullable<React.ReactNode>; open: boolean }> = memo(
  ({ fallback, children, open }) => {
    const fresh = useRef(true);
    useEffect(() => {
      if (open) {
        fresh.current = false;
      }
    }, [open]);
    return <React.Suspense fallback={fallback}>{(open || !fresh.current) && children}</React.Suspense>;
  },
);

export default LazyComponent;
