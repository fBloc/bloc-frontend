import React from "react";
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number | string;
  value: number | string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" className="mt-6" hidden={value !== index} {...other}>
      {value === index && children}
    </div>
  );
}

export { TabPanel };
