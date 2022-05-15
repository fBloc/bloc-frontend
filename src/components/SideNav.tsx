import React, { useCallback, useState } from "react";
import classNames from "classnames";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaEllipsisV } from "@/components/icons";
import { PAGES } from "@/router/pages";
import Logo from "@/assets/logo-name.png";
import { identificationInstance } from "@/shared/Identification";
import { auth } from "@/recoil/app/auth";

const paths = [
  {
    path: PAGES.flowList,
    title: "flow",
  },
  {
    path: PAGES.functions,
    title: "Functions",
  },
];
const SideNav = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const user = useRecoilValue(auth);
  const resetAuth = useResetRecoilState(auth);
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
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
          {user?.roles.includes("admin") && (
            <li className="mb-2">
              <NavLink
                to={PAGES.admin}
                className={({ isActive }) =>
                  classNames(
                    "flex items-center p-3 rounded-full hover:bg-gray-100 hover:no-underline hover:text-current",
                    isActive ? "bg-gray-100" : "",
                  )
                }
              >
                {t("createAccount")}
              </NavLink>
            </li>
          )}
        </ul>
        <p className="mt-auto w-full cursor-default flex items-center justify-between">
          <span className="p-2 rounded flex flex-grow overflow-hidden">
            <span className="w-8 h-8 rounded-full bg-primary-300 inline-flex items-center justify-center text-white font-medium  flex-shrink-0">
              {user?.name[0]}
            </span>
            <span className="flex-grow ml-2 font-medium text-xl overflow-hidden">
              <span className="w-full inline-block text-ellipsis overflow-hidden whitespace-nowrap">{user?.name}</span>
            </span>
          </span>
          <IconButton
            onClick={(e) => {
              setAnchor(e.currentTarget);
            }}
          >
            <FaEllipsisV size={14} />
          </IconButton>
        </p>
      </div>
      <Menu
        transformOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        anchorEl={anchor}
        open={!!anchor}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            identificationInstance.removeToken();
            handleClose();
            resetAuth();
            navigate(PAGES.login);
          }}
        >
          {t("logout")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default SideNav;
