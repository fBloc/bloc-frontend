import React from "react";
import classNames from "classnames";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { FaCheck, FaTimes } from "@/components/icons";
import { IconButton, DialogTitle, Divider, DialogProps, Dialog } from "@mui/material";
import { readableTime } from "@/shared/time";
import { formatText } from "@/shared/tools";
import { flowDetailState } from "@/recoil/flow/flow";

const AccessTag: React.FC<React.HTMLAttributes<HTMLSpanElement> & { active?: boolean }> = ({
  active,
  children,
  className,
  ...rest
}) => {
  return (
    <span
      className={classNames(
        "flex-grow flex items-center justify-center border-solid border border-gray-300 px-2 py-1 text-xs rounded",
        className,
        {
          "opacity-40": !active,
        },
      )}
      {...rest}
    >
      {active ? <FaCheck size={10} className="mr-2" /> : <FaTimes size={10} className="mr-2" />}
      {children}
    </span>
  );
};

const Info: React.FC<DialogProps> = ({ className, ...rest }) => {
  const flow = useRecoilValue(flowDetailState);
  const { t } = useTranslation();
  return (
    <Dialog maxWidth="sm" {...rest}>
      <div className={classNames(className, "p-4")}>
        <DialogTitle className="flex justify-between !p-0">
          <span>{t("basicInfo")}</span>
          <IconButton
            onClick={(e) => {
              rest.TransitionProps?.onExit?.(e.currentTarget);
            }}
          >
            <FaTimes size={14} />
          </IconButton>
        </DialogTitle>
        <p className="flex justify-between items-center my-4">
          <span className="bloc-description flex-shrink-0 mr-4">{t("name")}</span>
          <span>{formatText(flow?.name)}</span>
        </p>
        <p className="flex justify-between items-center mb-4">
          <span className="bloc-description flex-shrink-0 mr-4">{t("createdBy")}</span>
          <span>{formatText(flow?.createUserName)}</span>
        </p>
        <p className="flex justify-between items-center mb-4">
          <span className="bloc-description flex-shrink-0 mr-4">{t("createdAt")}</span>
          <span>{readableTime(flow?.createTime)}</span>
        </p>
        <Divider
          sx={{
            my: 2,
          }}
        />
        <div>
          <p className="bloc-description">{t("myPermissions")}</p>
          <p className="mt-2 flex whitespace-nowrap">
            <AccessTag active={flow?.read}>{t("view")}</AccessTag>
            <AccessTag className="ml-1.5" active={flow?.write}>
              {t("edit")}
            </AccessTag>
            <AccessTag className="ml-1.5" active={flow?.execute}>
              {t("excute")}
            </AccessTag>
            <AccessTag className="ml-1.5" active={flow?.delete}>
              {t("delete")}
            </AccessTag>
            <AccessTag className="ml-1.5" active={flow?.assignPermission}>
              {t("assignPermission")}
            </AccessTag>
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default Info;
