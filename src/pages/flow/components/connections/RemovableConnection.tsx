import React from "react";
import { useSetRecoilState } from "recoil";
import { getBezierPath, getEdgeCenter, EdgeProps } from "react-flow-renderer";
import { useTranslation } from "react-i18next";
import { FaTimes } from "@/components/icons";
import { Tooltip, Button } from "@mui/material";
import { EdgeData } from "@/shared/types";
import { FlowDisplayPage } from "@/shared/enums";
import { useRemoveConnection } from "@/recoil/hooks/useRemoveConnection";
import { beingRemovedConnectionAttrs } from "@/recoil/flow/connections";

const foreignObjectSize = 20;

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  source,
  sourceHandleId,
  target,
  targetHandleId,
  ...rest
}: EdgeProps<EdgeData>) {
  const { t } = useTranslation();
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const removeConnection = useRemoveConnection();
  const setBeingReMovedConnection = useSetRecoilState(beingRemovedConnectionAttrs);
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 4}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        {data?.mode === FlowDisplayPage.draft && (
          <div className="w-full h-full group flex items-center justify-center relative z-10">
            {/* <button className="w-1/2 h-[30px] bg-gray-100 inline-flex justify-center items-center hover:bg-gray-200 group-hover:scale-0 transition-transform">
              <FaEllipsisH size={12} />
            </button> */}
            <div className="h-full flex items-center justify-between absolute w-full">
              <Tooltip title={t("disconnect")}>
                <Button
                  disableElevation
                  sx={{
                    minWidth: 0,
                    width: foreignObjectSize,
                    height: foreignObjectSize,
                    padding: 0,
                    borderRadius: foreignObjectSize / 2,
                  }}
                  variant="contained"
                  color="inherit"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (data.atomIndexList.length < 2) {
                      removeConnection({
                        sourceNode: source,
                        sourceParam: sourceHandleId,
                        targetNode: target,
                        targetParam: targetHandleId,
                        isVoid: data.atomIndexList.length === 0,
                        targetAtomIndex: data.atomIndexList[0],
                      });
                    } else {
                      setBeingReMovedConnection({
                        open: true,
                        connection: {
                          id: id,
                          sourceNode: source,
                          sourceParam: sourceHandleId,
                          targetNode: target,
                          targetParam: targetHandleId,
                          targetAtomIndex: data.atomIndexList,
                        },
                      });
                    }
                  }}
                >
                  <FaTimes size={12} />
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </foreignObject>
    </>
  );
}
