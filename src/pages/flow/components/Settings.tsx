import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { TextField, Switch as MdSwitch, Button as MdButon, Tooltip, IconButton } from "@mui/material";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { showToast } from "@/components/toast";

import { FaClipboard } from "@/components/icons";
import { useTheme } from "@mui/material/styles";
import { flowDetailState } from "@/recoil/flow/flow";
import { useUpdateFlow } from "@/recoil/hooks/useUpdateFlow";
import { useDeleteFlow } from "@/recoil/hooks/useDeleteFlow";
export type SettingsProps = React.HTMLAttributes<HTMLDivElement>;

const SettingsSchema = Yup.object().shape({
  crontab: Yup.string().max(999, "太长了"),
  timeoutInSeconds: Yup.number().integer("必须是整数").min(0, "不能小于0").max(Number.MAX_SAFE_INTEGER),
  retryAmount: Yup.number().integer("必须是整数").min(0, "不能小于0").max(Number.MAX_SAFE_INTEGER),
  retryIntervalInSecond: Yup.number().integer("必须是整数").min(0, "不能小于0").max(Number.MAX_SAFE_INTEGER),
}); // TODO 文案完善

const Settings: React.FC<SettingsProps> = ({ className, ...rest }) => {
  const flow = useRecoilValue(flowDetailState);
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
            children: "保存成功",
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
                <p className="mb-3 text-lg font-medium flex items-center justify-between">触发设置</p>
                <p className="text-sm">crontab表达式</p>
                <TextField
                  placeholder="输入crontab表达式"
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
                    <span>允许使用key触发运行</span>
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
                        placeholder="输入key"
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
                            children: "已复制到粘贴板",
                            autoHideDuration: 1500,
                          });
                        }}
                      >
                        <span>
                          <Tooltip title="复制到粘贴板" placement="left">
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

                <p className="mt-6 text-lg font-medium">运行设置</p>
                <p className="mt-3 text-sm mb-1">超时设置（秒）</p>

                <TextField
                  value={values.timeoutInSeconds}
                  name="timeoutInSeconds"
                  type="number"
                  placeholder="超时时间"
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
                    <p className="mt-2 text-sm mb-1">重试次数</p>

                    <TextField
                      placeholder="输入重试次数"
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
                    <p className="mt-2 text-sm mb-1">重试间隔（秒）</p>

                    <TextField
                      placeholder="输入重试间隔"
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
                  <span>允许多个任务同时运行</span>

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
                  {canModifySettings ? "更新设置" : "你没有修改设置的权限"}
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
                  {canDelete ? "删除此项目" : "你没有删除此项目的权限"}
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
