import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactJson from "react-json-view";
import { getStorageDetail } from "@/api/storage";
import { AppSuspenseFallback } from "@/App";
import { Loading } from "@/components";
import { FaRegFrown } from "@/components/icons";
const Result = () => {
  const { key } = useParams<"key">();
  const [data, setData] = useState<{ isJson: boolean; data: any }>({ isJson: false, data: "" });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    async function main() {
      if (!key) return;
      setLoading(true);
      const { data, isValid } = await getStorageDetail(key);
      if (alive && isValid) {
        let isJson = false;
        let result = data;
        try {
          result = JSON.parse(data as any);
          isJson = typeof result === "object";
        } catch (error) {
          isJson = false;
        }
        setData({
          isJson,
          data: result,
        });
      }
      setLoading(false);
    }
    main();
    return () => {
      alive = false;
    };
  }, [key]);
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  if (!data.data)
    return (
      <div className="h-screen flex items-center justify-center">
        <div>
          {/* <FaRegFrown size={40} className="text-yellow-500 mx-auto" /> */}
          {/* <p className="mt-4 text-2xl">数据为空，可能是以下原因：</p> */}
          <p className="mt-4 text-2xl">运行结果数据为空</p>
          {/* <ul className="mt-3 pl-4 text-lg">
            <li className="list-disc">运行结果数据本身为空</li>
            <li className="list-disc">运行失败</li>
          </ul> */}
        </div>
      </div>
    );
  return (
    <div className="p-5">
      {data.isJson ? (
        <ReactJson
          name={false}
          src={data.data}
          enableClipboard={false}
          indentWidth={2}
          displayDataTypes={false}
          groupArraysAfterLength={500}
        />
      ) : (
        <p className="text-lg">{data.data}</p>
      )}
    </div>
  );
};
export default Result;
