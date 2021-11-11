import { useEffect, useState } from "react";
import hotkeys from "hotkeys-js";

export function useSpace() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onPressed = (e: KeyboardEvent) => {
      const keydown = e.type === "keydown";
      setActive(keydown);
    };
    hotkeys("space", { keyup: true }, onPressed);
    return () => {
      hotkeys.unbind("space", onPressed);
    };
  });
  return {
    active,
  };
}
