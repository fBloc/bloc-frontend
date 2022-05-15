import React, { useState, useMemo } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { TextField, IconButton, Box, Fab, Tabs, Tab } from "@mui/material";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import { createDraft, getDraftList, getList, isLaunchedFlow } from "@/api/flow";
import { FaPlus } from "@/components/icons";
import { handleValueChange } from "@/shared/form";
import {
  FlowListType,
  getRunningIcon,
  getRunningStateClass,
  getRunningStateText,
  getTriggerLabel,
  getTriggerValue,
  RunningStatusEnum,
} from "@/shared/enums";
import { List as ListComponent } from "@/components";
import { readableTime } from "@/shared/time";
import { FaBolt, FaPlay, FaStopCircle, FaSearch } from "@/components/icons";
import { flowDetailState, listCurrentOriginId } from "@/recoil/flow/flow";
import { flowListTab } from "@/recoil/flow/list";
import { Tooltip } from "@/components";
import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
const tabs = [
  {
    label: i18n.t("launched"),
    value: FlowListType.launched,
  },
  {
    label: i18n.t("draft"),
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
  const { t } = useTranslation("flow");
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
  const newDraft = useMutation(createDraft, {
    onSuccess: ({ isValid, data }) => {
      if (isValid) {
        navigate(`/flow/draft/${data?.originId}`);
      }
    },
  });

  return (
    <div className={classNames("flex flex-col relative", className)} {...rest}>
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
            <TextField
              placeholder={t("searchPlaceholder")}
              fullWidth
              inputProps={{
                maxLength: 60,
              }}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <FaSearch size={14} className="text-gray-400" />
                  </IconButton>
                ),
              }}
              // size="small"
              className="bg-gray-50"
              defaultValue={apiContains}
              onBlur={handleValueChange(setApiContains)}
            />
          </form>
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
            <Box
              key={item.id}
              className={classNames(
                "py-4 border-solid pr-4 pl-3 border-l-4 cursor-default",
                originId === item.origin_id ? styles.active : styles.normal,
              )}
              onClick={() => {
                setOriginId(item.origin_id);
              }}
            >
              <div className="flex justify-between items-center">
                {isLaunchedFlow(item) ? (
                  <Tooltip
                    title={
                      item.latest_run?.status === RunningStatusEnum.success ? (
                        <>
                          <p className="mt-2 opacity-60">{t("run.latestRun")}</p>
                          <hr className="my-3 opacity-10" />
                          <p className="text-xs flex justify-between items-center">
                            <span className="w-4 h-4 inline-flex justify-center items-center rounded-full  text-primary-400">
                              <FaBolt size={10} />
                            </span>
                            <span className="opacity-60">{t("run.triggerAt")}</span>
                            <span className="ml-6">{readableTime(item.latest_run.trigger_time)}</span>
                          </p>
                          <p className="my-2 text-xs flex justify-between">
                            <span className="w-4 h-4 inline-flex justify-center items-center rounded-full  text-green-400">
                              <FaPlay size={8} />
                            </span>
                            <span className="opacity-60">{t("run.startRunAt")}</span>
                            <span className="ml-6">{readableTime(item.latest_run.start_time)}</span>
                          </p>
                          <p className="text-xs flex justify-between">
                            <span className="w-4 h-4 inline-flex justify-center items-center rounded-full text-white-400">
                              <FaStopCircle size={10} />
                            </span>
                            <span className="opacity-60">{t("run.endRunAt")}</span>
                            <span className="ml-6">{readableTime(item.latest_run.end_time)}</span>
                          </p>
                          <hr className="my-4 opacity-10" />
                          <p className="mb-2">
                            <span className="px-2 mr-2 border-r border-solid border-gray-500 opacity-60">
                              {getTriggerLabel(item.latest_run.trigger_type)}
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
                        false
                      )
                    }
                    placement="top-start"
                  >
                    <span
                      className={classNames(
                        "rounded px-2 py-1 text-xs font-medium inline-flex items-center",
                        getRunningStateClass(item.latest_run?.status, {
                          bg: true,
                          text: true,
                        }),
                      )}
                    >
                      {getRunningIcon(item.latest_run?.status, "mr-1")}
                      {getRunningStateText(item.latest_run?.status)}
                    </span>
                  </Tooltip>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500 font-medium">
                    {t("draft")}
                  </span>
                )}
                <Tooltip title={item.create_user_name}>
                  <span className="cursor-default inline-block w-6 h-6 rounded-full bg-gray-100 leading-6 text-center text-xs">
                    {item.create_user_name[0]}
                  </span>
                </Tooltip>
              </div>
              <p className="mt-3 text-base">
                {item.name ||
                  t("untitled", {
                    ns: "common",
                  })}
              </p>
            </Box>
          ))}
        </ListComponent>
      </div>
      <Tooltip title={t("createFlow")}>
        <Fab
          color="primary"
          className="absolute"
          size="medium"
          sx={{
            bottom: 30,
            right: 30,
            position: "absolute",
          }}
          disabled={newDraft.isLoading}
          onClick={() => {
            newDraft.mutate({});
          }}
        >
          <FaPlus size={14} />
        </Fab>
      </Tooltip>
      {children}
    </div>
  );
};

export default List;
