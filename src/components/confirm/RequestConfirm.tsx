import React, { useCallback, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

export type ConfirmButtonProps = {
  Trigger: React.ReactElement;
  Confirm: React.ReactElement;
};
const ConfirmButton = React.forwardRef<HTMLButtonElement, ConfirmButtonProps>(({ Trigger, Confirm }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [atConfirm, setConfirm] = useState(false);
  const onClose = useCallback(() => {
    setConfirm(false);
  }, []);
  const RealTrigger = React.cloneElement(Trigger, {
    onClick: (e: any) => {
      Trigger.props.onClick?.(e);
      setConfirm(true);
    },
  });
  const RealConfirm = React.cloneElement(Confirm, {
    onClick: (e: any) => {
      Confirm.props.onClick?.(e);
      onClose();
    },
  });

  useClickOutside(containerRef, onClose);
  return <div ref={containerRef}>{atConfirm ? RealConfirm : RealTrigger}</div>;
});

export default ConfirmButton;
