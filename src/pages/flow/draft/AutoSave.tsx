import React, { useEffect, useRef, useState, memo } from "react";
import classNames from "classnames";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { FaCircleNotch } from "@/components/icons";
import { blocNodeList } from "@/recoil/flow/node";
import { useSyncFlow } from "@/recoil/hooks/useSave";
import { toSourceNodes } from "@/processors/convert";
import { flowDetailState } from "@/recoil/flow/flow";
import { DEFAULT_POSITION } from "@/shared/defaults";

export type AutoSaveProps = React.HTMLAttributes<HTMLDivElement>;
const AutoSave = React.forwardRef<HTMLDivElement, AutoSaveProps>(({ className, children, ...rest }, ref) => {
  const nodes = useRecoilValue(blocNodeList);
  const flowDetail = useRecoilValue(flowDetailState);
  const [loading, setLoading] = useState(false);
  const lock = useRef<number | null>(null);
  const syncFlow = useSyncFlow();

  useEffect(() => {
    let alive = true;

    async function main() {
      if (lock.current) {
        window.clearTimeout(lock.current);
      }
      lock.current = window.setTimeout(async () => {
        if (!flowDetail) return;
        setLoading(true);
        await syncFlow();
        if (alive) {
          setLoading(false);
        }
      }, 1000);
    }
    main();
    return () => {
      alive = false;
    };
  }, [nodes, syncFlow, flowDetail]);

  return (
    <div className={classNames("flex items-center text-gray-400", className)} ref={ref} {...rest}>
      {loading && (
        <>
          <FaCircleNotch className="animate-spin mr-1" size={12} />
          保存中...
        </>
      )}
      {children}
    </div>
  );
});

export default memo(AutoSave);
