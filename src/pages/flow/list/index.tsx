import React from "react";
import List from "./List";
import Preview from "./Preview";
import { useResetFlowWhenDestroy } from "@/recoil/hooks/useResetFlow";

const Flows = () => {
  useResetFlowWhenDestroy();
  return (
    <div className="flex bg-white">
      <List className="w-72 h-screen" />
      <div className="flex-grow h-screen bg-gray-50 relative">
        <Preview />
      </div>
    </div>
  );
};
export default Flows;
