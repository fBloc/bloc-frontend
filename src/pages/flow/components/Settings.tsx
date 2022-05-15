import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { TextField, Switch as MdSwitch, Button as MdButon, Tooltip, IconButton } from "@mui/material";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { showToast } from "@/components/toast";

import { FaClipboard } from "@/components/icons";
import { useTheme } from "@mui/material/styles";
import { flowDetailState } from "@/recoil/flow/flow";
import { useUpdateFlow } from "@/recoil/hooks/useUpdateFlow";
import { useDeleteFlow } from "@/recoil/hooks/useDeleteFlow";
import i18n from "@/i18n";

export type SettingsProps = React.HTMLAttributes<HTMLDivElement>;

const SettingsSchema = Yup.object().shape({
  crontab: Yup.string().max(
    99,
    i18n.t("crontabTooLong", {
      ns: "validation",
    }),
  ),
  timeoutInSeconds: Yup.number()
    .integer(
      i18n.t("mustBeInteger", {
        ns: "validation",
      }),
    )
    .min(
      0,
      i18n.t("mustGt0", {
        ns: "validation",
      }),
    )
    .max(Number.MAX_SAFE_INTEGER),
  retryAmount: Yup.number()
    .integer(
      i18n.t("mustBeInteger", {
        ns: "validation",
      }),
    )
    .min(0, i18n.t("mustGt0"))
    .max(Number.MAX_SAFE_INTEGER),
  retryIntervalInSecond: Yup.number()
    .integer(
      i18n.t("mustBeInteger", {
        ns: "validation",
      }),
    )
    .min(
      0,
      i18n.t("mustGt0", {
        ns: "validation",
      }),
    )
    .max(Number.MAX_SAFE_INTEGER),
}); // TODO 文案完善

const Settings: React.FC<SettingsProps> = ({ className, ...rest }) => {
  const flow = useRecoilValue(flowDetailState);
  const { t } = useTranslation("flow");
  const {
    allowParallelRun,
    allowTriggerByKey,
    retryAmount,
    retryIntervalInSecond,
    crontab,
    triggerKey,
    timeoutInSeconds,
  } = flow || {
    allowParallelRun: false,
    allowTriggerByKey: false,
    retryAmount: 0,
    retryIntervalInSecond: 0,
    crontab: "",
    triggerKey: "",
    timeoutInSeconds: 0,
  };
  const theme = useTheme();
  const deleteFlow = useDeleteFlow();
  const updateFlow = useUpdateFlow(); //TODO 修改接口
  const canModifySettings = flow?.execute === true;
  const canDelete = flow?.delete === true;
  return (
    <Formik
      enableReinitialize
      initialValues={{
        crontab,
        triggerKey,
        allowParallelRun,
        allowTriggerByKey,
        timeoutInSeconds,
        retryAmount,
        retryIntervalInSecond,
      }}
      validationSchema={SettingsSchema}
      onSubmit={async (values) => {
        const isvalid = await updateFlow(values);
        if (isvalid) {
          showToast({
            children: t("saved", {
              ns: "common",
            }),
            autoHideDuration: 1500,
          });
        }
      }}
    >
      {({ handleBlur, handleChange, setFieldValue, values, dirty }) => {
        return (
          <Form>
            <div className={classNames("mx-auto max-w-md", className)} {...rest}>
              <div className="my-4 bg-white p-4 rounded-lg relative border-solid border-gray-200 border">
                <p className="mb-3 text-lg font-medium flex items-center justify-between">{t("run.triggerSettings")}</p>
                <p className="text-sm">{t("info.crontabStr")}</p>
                <TextField
                  placeholder={t("info.crontabStr")}
                  fullWidth
                  name="crontab"
                  value={values.crontab}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputProps={{
                    readOnly: !canModifySettings,
                  }}
                />
                <p
                  className="mt-1"
                  style={{
                    color: theme.palette.error.main,
                  }}
                >
                  <ErrorMessage name="crontab" />
                </p>
                <div className="mt-4">
                  <p className="flex items-center justify-between">
                    <span>{t("info.allowTriggerByKey")}</span>
                    <MdSwitch
                      name="allowTriggerByKey"
                      checked={values.allowTriggerByKey}
                      onChange={(_, v) => {
                        setFieldValue("allowTriggerByKey", v);
                      }}
                      disabled={!canModifySettings}
                    />
                  </p>
                  <div
                    className={classNames(
                      "overflow-hidden transition-all",
                      values.allowTriggerByKey ? "max-h-20" : "max-h-0",
                    )}
                  >
                    <div className={classNames("mt-2 relative")}>
                      <TextField
                        className="bg-gray-50"
                        fullWidth
                        disabled
                        value={triggerKey}
                        InputProps={{
                          readOnly: !canModifySettings,
                        }}
                      />

                      <CopyToClipboard
                        text={triggerKey || ""}
                        onCopy={() => {
                          showToast({
                            children: t("copied", {
                              ns: "common",
                            }),
                            autoHideDuration: 1500,
                          });
                        }}
                      >
                        <span>
                          <Tooltip
                            title={t("copyToClipboard", {
                              ns: "common",
                            })}
                            placement="left"
                          >
                            <IconButton
                              sx={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                              }}
                              className="-translate-y-1/2 cursor-pointer p-0"
                            >
                              <FaClipboard size={12} />
                            </IconButton>
                          </Tooltip>
                        </span>
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-lg font-medium">
                  {t("runSettings", {
                    ns: "common",
                  })}
                </p>
                <p className="mt-3 text-sm mb-1">
                  {t("timeoutValue", {
                    ns: "common",
                  })}
                </p>

                <TextField
                  value={values.timeoutInSeconds}
                  name="timeoutInSeconds"
                  type="number"
                  placeholder={t("timeoutValue", {
                    ns: "common",
                  })}
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputProps={{
                    readOnly: !canModifySettings,
                  }}
                />
                <p
                  className="mt-1"
                  style={{
                    color: theme.palette.error.main,
                  }}
                >
                  <ErrorMessage name="timeoutInSeconds" />
                </p>
                <div className="mt-1 flex">
                  <div className="flex-1 mr-4">
                    <p className="mt-2 text-sm mb-1">{t("run.retryTimes")}</p>

                    <TextField
                      placeholder={t("run.retryTimes")}
                      fullWidth
                      value={values.retryAmount}
                      type="number"
                      name="retryAmount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      InputProps={{
                        readOnly: !canModifySettings,
                      }}
                    />
                    <p
                      className="mt-1"
                      style={{
                        color: theme.palette.error.main,
                      }}
                    >
                      <ErrorMessage name="retryAmount" />
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="mt-2 text-sm mb-1">{t("run.retryInterval")}</p>

                    <TextField
                      placeholder={t("run.retryInterval")}
                      fullWidth
                      type="number"
                      value={values.retryIntervalInSecond}
                      name="retryIntervalInSecond"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      InputProps={{
                        readOnly: !canModifySettings,
                      }}
                    />
                    <p
                      className="mt-1"
                      style={{
                        color: theme.palette.error.main,
                      }}
                    >
                      <ErrorMessage name="retryIntervalInSecond" />
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-center justify-between">
                  <span>{t("info.allowParallelRun")}</span>
                  <MdSwitch
                    checked={values.allowParallelRun}
                    name="allowParallelRun"
                    onChange={(_, v) => {
                      setFieldValue("allowParallelRun", v);
                    }}
                    disabled={!canModifySettings}
                  />
                </p>
                <hr className="my-6" />

                <MdButon
                  disabled={!dirty || !canModifySettings}
                  variant="contained"
                  fullWidth
                  disableElevation
                  type="submit"
                >
                  {canModifySettings
                    ? t("updateSettings", {
                        ns: "common",
                      })
                    : t("permissions.noUpdateSettings", {
                        ns: "common",
                      })}
                </MdButon>
                <MdButon
                  sx={{ mt: 2 }}
                  variant="outlined"
                  fullWidth
                  disableElevation
                  color="error"
                  disabled={!canDelete}
                  onClick={deleteFlow}
                >
                  {canDelete
                    ? t("deleteProject", {
                        ns: "common",
                      })
                    : t("permissions.noDelete", {
                        ns: "common",
                      })}
                </MdButon>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default Settings;
