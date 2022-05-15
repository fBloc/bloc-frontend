import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaSitemap } from "@/components/icons";
import { MergedInputParam } from "@/api/flow";
import { useQueries } from "@/recoil/hooks/useQueries";
export const ArrowConenction = () => {
  return (
    <svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.5 0L0.499999 20" stroke="#E0E0E0" />
      <path d="M13 20H2.98023e-08" stroke="#E0E0E0" />
      <path d="M16 19.5L12.25 21.6651V17.3349L16 19.5Z" fill="#E0E0E0" />
    </svg>
  );
};
export type ConenctionProps = {
  value?: MergedInputParam["atoms"][number];
  onReset: () => void;
};
const Connection: React.FC<ConenctionProps> = ({ value, onReset }) => {
  const { queryNode, querySourceParam } = useQueries();
  const targetNode = useMemo(() => {
    return queryNode(value?.sourceNode) || null;
  }, [value, queryNode]);
  const targetParam = useMemo(() => {
    return querySourceParam(targetNode, value?.sourceParam);
  }, [targetNode, value, querySourceParam]);
  const { t } = useTranslation("flow");
  return (
    <>
      <p className="flex items-center">
        <span className="w-4 h-4 rounded bg-gray-600 inline-flex items-center justify-center">
          <FaSitemap size={10} color="#fff" />
        </span>
        <span className="ml-2 text-xs text-gray-400">{targetNode?.note || targetNode?.function?.name || "-"}</span>
        <span className="ml-auto cursor-default">
          <span className="w-12 bg-success bg-opacity-10 text-success text-xs h-5 rounded inline-flex justify-center items-center group-hover:hidden">
            {t("params.connected")}
          </span>
          <span
            className="w-12 bg-red-400 bg-opacity-10 text-red-400 text-xs h-5 rounded items-center justify-center hidden group-hover:inline-flex"
            onClick={onReset}
          >
            {t("clear", {
              ns: "common",
            })}
          </span>
        </span>
      </p>
      <div className="mt-4 flex pl-6">
        <ArrowConenction />
        <p className="ml-2 mt-2">{targetParam?.description || "-"}</p>
      </div>
    </>
  );
};

export default Connection;
