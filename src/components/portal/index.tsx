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

const Portal: React.FC<PortalProps> = ({ children, mountNode = document.body, disabled }) => {
  const propsChildren = children;
  const mountAt = getMountNode(mountNode);
  if (!mountAt || disabled) return <>{children}</>;
  return ReactDOM.createPortal(propsChildren, mountAt);
};

export default Portal;
