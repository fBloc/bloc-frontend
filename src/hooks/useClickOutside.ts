import React, { useCallback } from "react";

export function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void, lazy = false) {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current?.contains(e.target as any)) {
        callback();
      }
    },
    [callback, ref],
  );
  React.useLayoutEffect(() => {
    if (!lazy) {
      document.addEventListener("click", handleClick);
    }
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick, lazy]);
  return {
    run: () => {
      document.addEventListener("click", handleClick);
    },
    destroy: () => {
      document.removeEventListener("click", handleClick);
    },
  };
}
