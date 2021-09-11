import ReactDOM from "react-dom";
import React from "react";

export interface PortalProps {
  children?: React.ReactNode;
  mountNode?: HTMLElement | (() => HTMLElement | null) | null;
  disabled?: boolean;
}
function getMountNode(node: PortalProps["mountNode"]) {
  return typeof node === "function" ? node() : node;
}

const Portal = React.forwardRef<any, PortalProps>(
  ({ children, mountNode = document.body, disabled = false, ...rest }, ref) => {
    let propsChildren = children;
    const mountAt = getMountNode(mountNode);
    if (!mountAt || disabled) return <>{children}</>;
    if (React.isValidElement(children)) {
      propsChildren = React.cloneElement(children, {
        ...rest,
        ref,
      });
    }
    return ReactDOM.createPortal(propsChildren, mountAt);
  },
);

export default Portal;
