import React, { useCallback, useState } from "react";
import classNames from "classnames";
import { NavLink } from "react-router-dom";
import { Menu, MenuItem } from "@mui/material";
import { PAGES } from "@/router/pages";
import Logo from "@/assets/logo-name.png";

const paths = [
  {
    path: PAGES.flowList,
    title: "flow",
  },
  {
    path: PAGES.functions,
    title: "Functions",
  },
  {
    path: PAGES.about,
    title: "关于",
  },
];
const SideNav = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useCallback(() => {
    setAnchor(null);
  }, []);
  return (
    <>
      <div className="sticky left-0 top-0 w-56 p-4 flex-shrink-0 h-screen border-solid border-r border-gray-100 flex flex-col items-start bg-white">
        <img src={Logo} alt="logo" className="h-8 mb-2" />
        <ul className="mt-6 w-full text-xl font-medium">
          {paths.map(({ path, title }) => (
            <li className="mb-2" key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  classNames(
                    "block p-3 rounded-full hover:bg-gray-100 hover:no-underline hover:text-current",
                    isActive ? "bg-gray-100" : "",
                  )
                }
              >
                {title}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="mt-auto w-full cursor-default">
          <span
            className="p-2 hover:bg-gray-50 rounded flex w-full"
            onClick={(e) => {
              setAnchor(e.currentTarget);
            }}
          >
            <span className="w-8 h-8 rounded-full bg-primary-300 inline-flex items-center justify-center text-white font-medium">
              B
            </span>
            <span className="ml-2 font-medium text-xl">bloc</span>
          </span>
        </p>
      </div>
      <Menu anchorEl={anchor} open={!!anchor} onClose={handleClose}>
        <MenuItem onClick={handleClose}>退出登录</MenuItem>
      </Menu>
    </>
  );
};

export default SideNav;
