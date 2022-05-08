import React, { useState, useMemo, useEffect } from "react";
import classNames from "classnames";
import { useRecoilState, useResetRecoilState } from "recoil";
import { Tooltip } from "@mui/material";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { createDraft, getDraftList, getList, isLaunchedFlow } from "@/api/flow";
import { Button, Input } from "@/components";
import { FaPlus } from "@/components/icons";
import { handleValueChange } from "@/shared/form";
import {
  FlowListType,
  getRunningStateClass,
  getRunningStateText,
  getTriggerLabel,
  getTriggerValue,
  RunningStatusEnum,
} from "@/shared/enums";
import { List as ListComponent } from "@/components";
import { readableTime } from "@/shared/time";
import { FaBolt, FaPlay, FaStopCircle } from "@/components/icons";
import { flowDetailState, listCurrentOriginId } from "@/recoil/flow/flow";
import { flowListTab } from "@/recoil/flow/list";
import styles from "./index.module.scss";
import { Tabs, Tab } from "@mui/material";
const tabs = [
  {
    label: "已发布",
    value: FlowListType.launched,
  },
  {
    label: "草稿",
    value: FlowListType.draft,
  },
];

interface ItemsProps extends React.HTMLAttributes<HTMLDivElement> {}
const List: React.FC<ItemsProps> = ({ className, children, style, ...rest }) => {
  const [originId, setOriginId] = useRecoilState(listCurrentOriginId);
  const resetOriginId = useResetRecoilState(listCurrentOriginId);
  const [apiContains, setApiContains] = useState("");
  const [tab, setTab] = useRecoilState(flowListTab);
  const resetFlow = useResetRecoilState(flowDetailState);

  const fullKeyWord = useMemo(
    () => (apiContains.length > 5 ? `${apiContains.slice(0, 5)}...` : apiContains),
    [apiContains],
  );
  const { data: launchedListData, isLoading } = useQuery(
    ["getLaunchedFlow", getList, tab, apiContains],
    () =>
      getList({
        contains: apiContains,
      }),
    {
      enabled: tab === FlowListType.launched,
      refetchOnWindowFocus: false,
    },
  );
  const { data: draftListData, isLoading: isDraftLoading } = useQuery(
    ["getDraftList", getDraftList, tab, apiContains],
    () =>
      getDraftList({
        contains: apiContains,
      }),
    {
      enabled: tab === FlowListType.draft,
      refetchOnWindowFocus: false,
    },
  );
  const loading = useMemo(() => isLoading || isDraftLoading, [isLoading, isDraftLoading]);
  const list = useMemo(() => {
    return (tab === FlowListType.draft ? draftListData?.data : launchedListData?.data) || [];
  }, [tab, draftListData, launchedListData]);
  const navigate = useNavigate();
  // const newDraft = useCallback(async () => {
  //   const { isValid, data } = await createDraft({});
  //   if (isValid) {
  //     navigate(`/flow/edit/${data?.originId}`);
  //   }
  // }, [navigate]);
  const newDraft = useMutation(() => createDraft(), {
    onSuccess: ({ isValid, data }) => {
      if (isValid) {
        navigate(`/flow/draft/${data?.originId}`);
      }
    },
  });

  useEffect(() => {
    resetFlow();
    setOriginId("");
  }, [apiContains, resetFlow, setOriginId]);
  return (
    <div className={classNames("flex flex-col", className)} {...rest}>
      <div
        className="p-3"
        style={{
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Tabs
          className="mb-4"
          value={tab}
          onChange={(_, value) => {
            resetFlow();
            resetOriginId();
            setTab(value as FlowListType);
          }}
        >
          {tabs.map((tab) => (
            <Tab
              sx={{
                width: "50%",
              }}
              key={tab.value}
              {...tab}
            />
          ))}
        </Tabs>
        <div className="flex items-center">
          <form
            className="flex-grow"
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              setApiContains(form.querySelector("input")?.value || "");
            }}
          >
            <Input
              placeholder="输入关键词搜索Flow"
              block
              defaultValue={apiContains}
              onBlur={handleValueChange(setApiContains)}
            />
          </form>
          <Tooltip title="创建Flow">
            <Button
              className="ml-2 h-10 w-10 flex items-center justify-center bg-gray-100"
              rounded
              disabled={newDraft.isLoading}
              onClick={() => {
                newDraft.mutate();
              }}
            >
              <FaPlus size={14} />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="overflow-auto flex-grow pb-96">
        <ListComponent
          loading={loading}
          skeleton={{
            className: "p-3",
            paragraph: {
              rows: 10,
              className: "my-2 rounded-md",
            },
          }}
          emptyNode={
            <div className={classNames("py-20 text-center text-gray-400")} style={style}>
              {apiContains ? `暂无与"${fullKeyWord}"相关的flow` : "暂无数据"}
            </div>
          }
        >
          {list.map((item) => (
            <div
              key={item.id}
              className={classNames(
                "py-5 border-solid pr-4 pl-3 border-gray-100 border-b border-l-4 cursor-default",
                originId === item.origin_id ? styles.active : styles.normal,
              )}
              onClick={() => {
                setOriginId(item.origin_id);
              }}
            >
              <p className="flex justify-between items-center">
                {isLaunchedFlow(item) ? (
                  <Tooltip
                    title={
                      item.latest_run?.status === RunningStatusEnum.success ? (
                        <>
                          <p className="mt-2 opacity-60">最近一次运行</p>
                          <hr className="my-3 opacity-10" />
                          <p className="text-xs flex justify-between items-center">
                            <span className="w-4 h-4 inline-flex justify-center items-center rounded-full  text-primary-400">
                              <FaBolt size={10} />
                            </span>
                            <span className="opacity-60">触发时间</span>
                            <span className="ml-6">{readableTime(item.latest_run.trigger_time)}</span>
                          </p>
                          <p className="my-2 text-xs flex justify-between">
                            <span className="w-4 h-4 inline-flex justify-center items-center rounded-full  text-green-400">
                              <FaPlay size={8} />
                            </span>
                            <span className="opacity-60">开始时间</span>
                            <span className="ml-6">{readableTime(item.latest_run.start_time)}</span>
                          </p>
                          <p className="text-xs flex justify-between">
                            <span className="w-4 h-4 inline-flex justify-center items-center rounded-full text-white-400">
                              <FaStopCircle size={10} />
                            </span>
                            <span className="opacity-60">结束时间</span>
                            <span className="ml-6">{readableTime(item.latest_run.end_time)}</span>
                          </p>
                          <hr className="my-4 opacity-10" />
                          <p className="mb-2">
                            <span className="px-2 mr-2 border-r border-solid border-gray-500 opacity-60">
                              {getTriggerLabel(item.latest_run.trigger_type)}触发
                            </span>
                            {getTriggerValue({
                              type: item.latest_run.trigger_type,
                              user: item.latest_run.trigger_user_name,
                              crontab: item.crontab,
                              key: item.latest_run.trigger_key,
                            })}
                          </p>
                        </>
                      ) : (
                        <span></span>
                      )
                    }
                    placement="top-start"
                  >
                    <span
                      className={classNames(
                        "px-2 py-1 rounded-full text-xs  font-medium",
                        classNames(
                          getRunningStateClass(item.latest_run?.status, {
                            text: true,
                            bg: true,
                          }),
                        ),
                      )}
                    >
                      {getRunningStateText(item.latest_run?.status)}
                    </span>
                  </Tooltip>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500 font-medium">草稿</span>
                )}
                <Tooltip title={item.create_user_name}>
                  <span className="cursor-default inline-block w-6 h-6 rounded-full bg-gray-100 leading-6 text-center text-xs">
                    {item.create_user_name[0]}
                  </span>
                </Tooltip>
              </p>
              <p className="mt-4 text-base">{item.name || "未命名"}</p>
            </div>
          ))}
        </ListComponent>
      </div>
      {children}
    </div>
  );
};

export default List;
