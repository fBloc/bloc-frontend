import { useSetRecoilState } from "recoil";
import { operationRecords } from "@/recoil/flow/param";
import { useCallback } from "react";
import { OperationRecord } from "@/shared/types";

export function useTempConnection() {
  const setRecords = useSetRecoilState(operationRecords);
  const tempAddConnection = useCallback(
    (connection: Omit<OperationRecord, "type">) => {
      setRecords((previous) => {
        return [
          ...previous,
          {
            type: "connect",
            ...connection,
          },
        ];
      });
    },
    [setRecords],
  );
  const tempRemoveConnection = useCallback(
    (connection: Omit<OperationRecord, "type">) => {
      setRecords((previous) => {
        return [
          ...previous,
          {
            type: "disconnect",
            ...connection,
          },
        ];
      });
    },
    [setRecords],
  );
  return {
    tempAddConnection,
    tempRemoveConnection,
  };
}
