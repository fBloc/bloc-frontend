import React, { useMemo } from "react";
import classNames from "classnames";

export type AvatarSkeletonProps = {
  shape?: "circle" | "aquare";
  size?: number | string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ParagraphSkeletonProps = {
  rows?: number;
  /**
   * 每行固定宽度
   */
  fixedWidth?: boolean | boolean | number;
} & React.HTMLAttributes<HTMLDivElement>;
// TODO 类型优化

export type SkeletonProps = {
  avatar?: boolean | AvatarSkeletonProps;
  paragraph?: boolean | ParagraphSkeletonProps;
} & React.HTMLAttributes<HTMLDivElement>;

type DivProps = Partial<React.HTMLAttributes<HTMLDivElement>>;
type PartialProps<T extends DivProps | boolean | undefined> = Partial<Exclude<T, boolean | undefined>>;

function getProps<T extends DivProps | boolean | undefined>(source: T, defaultProps: PartialProps<T>): DivProps | null {
  if (typeof source === "undefined") return null;
  if (typeof source === "boolean") return source ? defaultProps : null;
  return {
    ...source,
    className: classNames(source.className, defaultProps.className),
    style: {
      ...source.style,
      ...defaultProps.style,
    },
  };
}

const AvatarSekeleton: React.FC<AvatarSkeletonProps> = ({ shape, size, className, style, ...rest }) => {
  return (
    <div
      {...rest}
      className={classNames(
        "bg-gray-100",
        {
          "rounded-full": shape === "circle",
        },
        className,
      )}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    ></div>
  );
};
const ParagraphSekeleton: React.FC<ParagraphSkeletonProps> = ({ className, rows = 1, fixedWidth, style, ...rest }) => {
  const widthList = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < rows; i++) {
      const isBoolean = typeof fixedWidth === "boolean";
      const isNumber = typeof fixedWidth === "number";
      const isUndefined = typeof fixedWidth === "undefined";
      let width: string = "100%";
      if (typeof fixedWidth === "string" && parseFloat(fixedWidth) > 0) {
        width = fixedWidth;
      }
      if (isBoolean) {
        width = "100%";
      }
      if (isNumber) {
        width = fixedWidth < 0 || isNaN(fixedWidth) ? "100%" : `${fixedWidth}px`;
      }
      if (isUndefined) {
        width = `${Math.min(1, Math.random() + 0.3) * 100}%`;
      }
      result.push(width);
    }
    return result;
  }, [rows, fixedWidth]);
  return (
    <>
      {widthList.map((item, index) => (
        <p
          key={index}
          className={classNames(
            "h-6 bg-gray-100 animate-pulse",
            className,
            index === widthList.length - 1 ? "" : " mb-1",
          )}
          style={{
            width: item,
            ...style,
          }}
          {...rest}
        ></p>
      ))}
    </>
  );
};

const Skeleton: React.FC<SkeletonProps> = ({ avatar, paragraph, ...rest }) => {
  const avatarProps = useMemo(
    () =>
      getProps(avatar, {
        shape: "circle",
      }),
    [avatar],
  );
  const paragraphProps = useMemo(
    () =>
      getProps(paragraph, {
        rows: 4,
      }),
    [paragraph],
  );
  let el: React.ReactNode = <ParagraphSekeleton rows={2} />;
  if (avatarProps) {
    el = <AvatarSekeleton {...avatarProps} />;
  }
  if (paragraph) {
    el = <ParagraphSekeleton {...paragraphProps} />;
  }
  return <div {...rest}>{el}</div>;
};
export default Skeleton;
