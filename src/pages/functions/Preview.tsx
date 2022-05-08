import React, { useState } from "react";
import { Dialog, DialogProps, Tabs, Tab, DialogTitle, IconButton } from "@mui/material";
import { FaTimes } from "@/components/icons";
import { FunctionItem } from "@/api/functions";
import { TextFallback } from "@/shared/jsxUtils";
import { TabPanel } from "@/components";
const Preview: React.FC<DialogProps & { onExit: () => void; fn: FunctionItem | null }> = ({ fn, onExit, ...props }) => {
  const [tab, setTab] = useState("input");

  return (
    <Dialog
      {...props}
      maxWidth="sm"
      TransitionProps={{
        onExited: () => {
          setTab("input");
        },
      }}
      fullWidth
    >
      <DialogTitle className="flex justify-between items-center">
        <span>函数详情</span>
        <IconButton
          onClick={onExit}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <FaTimes size={14} />
        </IconButton>
      </DialogTitle>
      <div className="px-6 pb-6">
        <p className="mt-2 text-lg mb-1">{fn?.name}</p>
        <p className="text-gray-400">{TextFallback(fn?.description, "暂无描述")}</p>
        <Tabs
          sx={{ mt: 2 }}
          value={tab}
          onChange={(_, v) => {
            setTab(v);
          }}
        >
          <Tab label={`输入参数(${fn?.ipt.length})`} value="input" />
          <Tab label={`输出参数(${fn?.opt.length})`} value="output" />
        </Tabs>
        <TabPanel value={tab} index="input">
          <div>
            {fn?.ipt.map((param, paramIndex) => (
              <div className="mb-4" key={param.key}>
                <div className="flex">
                  <span className="inline-flex h-8 w-8 rounded-full justify-center items-center bg-gray-100">
                    {paramIndex + 1}
                  </span>
                  <div className="ml-3 flex-grow">
                    <p className="font-medium">{param.description}</p>
                    <p className="text-gray-400">{param.key}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {param.atoms.map((atom, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded">
                          <p className="text-sm">{TextFallback(atom.description, "暂无描述")}</p>
                          <p className="mt-3 text-gray-500 text-xs">
                            <span>{atom.valueType}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>
        <TabPanel value={tab} index="output">
          <div>
            {fn?.opt.map((param, paramIndex) => (
              <div className="mb-4 " key={param.key}>
                <div className="flex">
                  <span className="inline-flex h-8 w-8 rounded-full justify-center items-center bg-gray-100">
                    {paramIndex + 1}
                  </span>
                  <div className="ml-3 flex-grow flex justify-between items-center">
                    <div>
                      <p className="font-medium">{param.description}</p>
                      <p className="text-gray-400">{param.key}</p>
                    </div>
                    <p>
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">{param.valueType}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {fn?.opt.length === 0 && <p className="text-center bg-gray-50 p-5 rounded text-gray-400">无输出参数</p>}
          </div>
        </TabPanel>
      </div>
    </Dialog>
  );
};

export default Preview;
