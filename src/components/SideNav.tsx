import React from "react";
import { NavLink } from "react-router-dom";
import { PAGES } from "@/router/pages";
import Logo from "@/assets/images/logo-name.png";

const SideNav = () => {
  return (
    <div className="flex-shrink-0 w-56 p-4 h-screen border-solid border-r border-gray-100 flex flex-col items-start">
      <img src={Logo} alt="" className="h-8 mb-2" />
      <ul className="mt-6 w-full text-xl font-medium">
        <li className="mb-2">
          <NavLink
            to={PAGES.flowList}
            className="block p-3 rounded-full hover:bg-gray-100 hover:no-underline hover:text-current"
            activeClassName="bg-gray-100"
          >
            flow
          </NavLink>
        </li>
        {/* <li className="mb-2">
          <NavLink
            to={PAGES.arrangementList}
            className="block p-3 rounded-full hover:bg-gray-100 hover:no-underline hover:text-current"
            activeClassName="bg-gray-100"
          >
            编排
          </NavLink>
        </li> */}
        <li className="mb-2">
          <NavLink
            to={PAGES.about}
            className="block p-3 rounded-full hover:bg-gray-100 hover:no-underline hover:text-current"
            activeClassName="bg-gray-100"
          >
            关于
          </NavLink>
        </li>
      </ul>
      <p className="mt-auto">
        <span className="w-8 h-8 rounded-full bg-blue-300 inline-flex items-center justify-center text-white font-medium">
          B
        </span>
        <span className="ml-2 font-medium text-xl">bloc</span>
      </p>
    </div>
  );
};

export default SideNav;
