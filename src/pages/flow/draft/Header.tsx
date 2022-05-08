import React, { useCallback } from "react";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Tooltip, IconButton } from "@mui/material";
import { FaChevronLeft, FaRegPaperPlane } from "@/components/icons";
import { Button, EditableText } from "@/components";
import { PAGES } from "@/router/pages";
import { flowDetailState } from "@/recoil/flow/flow";
import AutoSave from "./AutoSave";
import { launch } from "@/api/flow";
import { showToast } from "@/components/toast";
import { useUpdateFlow } from "@/recoil/hooks/useUpdateFlow";
const DraftFlowHeader = () => {
  const flow = useRecoilValue(flowDetailState);
  const navigate = useNavigate();
  const launchFlow = useCallback(async () => {
    if (!flow?.id) {
      //TODO
      return;
    }
    const { isValid, data } = await launch(flow.id);
    if (isValid) {
      showToast({
        children: "已发布！",
        autoHideDuration: 1500,
      });
      navigate(`/flow/detail/${data?.originId}`);
    }
  }, [flow, navigate]);
  return (
    <div>
      <Button variant="plain">自动规整</Button>
      <Button intent="primary" className="ml-2 inline-flex items-center" onClick={launchFlow}>
        <FaRegPaperPlane className="inline-block mr-2" size={12} />
        发布
      </Button>
    </div>
  );
};
type HeaderBarProps = React.HTMLAttributes<HTMLDivElement> & {};
const HeaderBar: React.FC<HeaderBarProps> = ({ children, className, ...rest }) => {
  const flow = useRecoilValue(flowDetailState);
  const setInfo = useUpdateFlow();
  return (
    <div className={classNames("px-3 py-2 bg-white shadow flex items-center justify-between", className)} {...rest}>
      <div className="flex-1 flex items-center">
        <Tooltip title="返回">
          <Link to={PAGES.flowList}>
            <IconButton>
              <FaChevronLeft size={14} />
            </IconButton>
          </Link>
        </Tooltip>
        <div className="w-60">
          <Tooltip title="重命名" placement="left-start">
            <EditableText
              key={flow?.name}
              className="ml-4 font-medium"
              defaultValue={flow?.name}
              placeholder="flow名称"
              inputProps={{
                maxLength: __MAX_FLOW_NAME_LENGTH__,
                className: "hover:bg-gray-50 focus:bg-gray-100 !px-2 rounded",
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value !== flow?.name) {
                  setInfo({
                    name: e.target.value || "未命名项目",
                  });
                }
              }}
            />
          </Tooltip>
        </div>
        <AutoSave className="ml-8" />
      </div>
      <DraftFlowHeader />
      {children}
    </div>
  );
};
export default HeaderBar;
