import { Link, LinkProps } from "react-router-dom";
import React, { memo } from "react";
import LogoWithName from "@/assets/images/logo-name.png";

const LogoRoute = memo((props: LinkProps) => {
  return (
    <Link {...props}>
      <img src={LogoWithName} alt="logo" className="h-6" />
    </Link>
  );
});

export default LogoRoute;
