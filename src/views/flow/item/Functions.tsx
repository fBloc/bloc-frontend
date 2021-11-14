import React, { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { StoreContext } from "./store";
import { Tree } from "@blueprintjs/core";
import { Slide, TransitionProps } from "@/components/transition";

type FunctionsProps = Omit<TransitionProps, "open"> & React.HTMLProps<HTMLDivElement>;

const Functions = observer<FunctionsProps, HTMLDivElement>(
  ({ onExit, onExited, onEnter, onEntered, timeout, timingFunction, className, ...rest }, ref) => {
    const store = useContext(StoreContext);
    const [indexList, setIndex] = useState<number[]>([]);
    return (
      <Slide
        open={store.editing}
        direction="left"
        onExit={onExit}
        onEnter={onEnter}
        onExited={onExit}
        onEntered={onEntered}
        timeout={timeout}
        timingFunction={timingFunction}
        className={className}
      >
        <aside ref={ref} className="bg-white p-2 shadow h-full w-60 rounded-lg" {...rest}>
          <Tree
            onNodeClick={(node) => {
              setIndex((previous) => {
                const numberId = Number(node.id);
                const opened = previous.includes(numberId);
                return opened ? previous.filter((item) => item !== numberId) : [...previous, numberId];
              });
            }}
            contents={store.functions.map((group, index) => ({
              id: index,
              hasCaret: true,
              icon: "folder-close",
              isExpanded: indexList.includes(index),
              label: group.group_name,
              childNodes: group.functions.map((func) => ({
                id: func.id,
                hasCaret: false,
                label: (
                  <div
                    draggable={true}
                    onDragStart={() => {
                      store.setSourceFunction(func.id);
                    }}
                  >
                    {func.name}
                  </div>
                ),
              })),
            }))}
          />
        </aside>
      </Slide>
    );
  },
  { forwardRef: true },
);

export default Functions;
