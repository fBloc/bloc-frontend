import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { FixedConnection } from "@/shared/types";
import { blocNodeList } from "../flow/node";
import { addConnection as _addConnection } from "@/processors/connections";

export function useAddConnection() {
  const setBlocNodeList = useSetRecoilState(blocNodeList);
  const addConnection = useCallback(
    (connection: FixedConnection) => {
      setBlocNodeList((previous) => _addConnection(previous, connection));
    },
    [setBlocNodeList],
  );
  return addConnection;
}
