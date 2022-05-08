import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { functionGroupState } from "@/recoil/functions";
import { FaUser } from "@/components/icons";
import Preview from "./Preview";
import { FunctionItem } from "@/api/functions";

const Functions = () => {
  const functions = useRecoilValue(functionGroupState);
  const [visible, setVisible] = useState(false);
  const [fn, setFn] = useState<FunctionItem | null>(null);
  return (
    <>
      <div className="p-10">
        {functions.map((group) => (
          <div key={group.groupName} className="mb-8">
            <p className="text-xs mb-2">{group.groupName}</p>
            <div className="grid grid-cols-6 gap-4">
              {group.functions.map((fn) => (
                <div
                  key={fn.id}
                  className="bg-white p-3 shadow rounded"
                  onClick={() => {
                    setVisible(true);
                    setFn(fn);
                  }}
                >
                  <p>{fn.name}</p>
                  <p className="mt-2 text-gray-500 text-xs leading-5">{fn.description}</p>
                  <hr className="my-2" />
                  <p className="text-xs flex items-center text-gray-400">
                    <FaUser size={10} className="mr-1" />
                    {fn.provider}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Preview
        open={visible}
        fn={fn}
        onExit={() => {
          setVisible(false);
        }}
      />
    </>
  );
};

export default Functions;
