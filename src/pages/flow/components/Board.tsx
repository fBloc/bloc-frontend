import React from "react";
import Loading from "@/components/loading";

type BoardProps = {
  loadingFlow?: boolean;
};

const Board: React.FC<BoardProps> = ({ children, loadingFlow = false }) => {
  return (
    <>
      {loadingFlow && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loading size={30} />
        </div>
      )}
      {children}
    </>
  );
};

export default Board;
