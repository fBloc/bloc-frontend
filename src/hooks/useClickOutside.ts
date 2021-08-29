import React from "react";

export function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current?.contains(e.target as any)) {
      callback();
    }
  };
  React.useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
}
