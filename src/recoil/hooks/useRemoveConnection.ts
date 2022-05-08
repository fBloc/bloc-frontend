import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { FixedConnection } from "@/shared/types";
import { blocNodeList } from "../flow/node";
import { removeConnection as _removeConnection } from "@/processors/connections";

export function useRemoveConnection() {
  const setBlocNodeList = useSetRecoilState(blocNodeList);
  const removeConnection = useCallback(
    (connection: FixedConnection) => {
      setBlocNodeList((previous) => _removeConnection(previous, connection));
    },
    [setBlocNodeList],
  );
  return removeConnection;
}
