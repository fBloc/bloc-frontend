import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { getValidValue, NumbericInput } from "../input";
import { FaChevronLeft, FaChevronRight } from "@/components/icons";
import classNames from "classnames";
import { handleValueChange } from "@/shared/form";
export type Paginationprops = React.HTMLAttributes<HTMLDivElement> & {
  total?: number;
  pageSize?: number;
  currentPage?: number;
  disabled?: boolean;
  onCurrentPageChange?: (page: number) => void;
  onNextPage?: (page: number) => void;
  onPreviousPage?: (page: number) => void;

  /**
   * 只有一页时，隐藏分页
   */
  hideOnSinglePage?: boolean;
};
const Pagination: React.FC<Paginationprops> = ({
  total = 0,
  pageSize = 10,
  currentPage = 1,
  disabled,
  onCurrentPageChange,
  onNextPage,
  onPreviousPage,
  className,
  hideOnSinglePage,
  ...rest
}) => {
  const pageLength = useMemo(() => Math.ceil(total / pageSize), [pageSize, total]);
  const [inner, setInnerCur] = useState("");
  useLayoutEffect(() => {
    setInnerCur(currentPage.toString());
  }, [currentPage]);
  if ((hideOnSinglePage && pageLength <= 1) || total === 0) return null;
  return (
    <div className={classNames("flex items-center", className)} {...rest}>
      <button
        title="上一页"
        className={classNames("mr-1.5 p-1", {
          "cursor-not-allowed text-gray-300": currentPage === 1 || disabled,
        })}
        disabled={currentPage === 1 || disabled}
        onClick={() => {
          const v = currentPage - 1;
          onPreviousPage?.(v);
          onCurrentPageChange?.(v);
        }}
      >
        <FaChevronLeft />
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = getValidValue(inner, currentPage.toString(), {
            int: true,
            min: 1,
            max: pageLength,
          });
          setInnerCur?.(value);
          const valueAsNum = Number(value);
          if (valueAsNum !== currentPage) {
            onCurrentPageChange?.(valueAsNum);
          }
        }}
      >
        <NumbericInput
          min={1}
          max={pageLength}
          int
          value={inner}
          className="w-10 !h-8 text-center !px-1.5"
          onChange={handleValueChange(setInnerCur)}
          disabled={disabled}
          onBlur={(e) => {
            const value = Number(e.target.value);
            if (value !== currentPage) {
              onCurrentPageChange?.(value);
            }
          }}
        />
      </form>
      <span className="mx-2">/</span>
      {pageLength}
      <button
        title="下一页"
        className={classNames("ml-1.5 p-1", {
          "cursor-not-allowed text-gray-300": currentPage >= pageLength || disabled,
        })}
        disabled={currentPage === pageLength || disabled}
        onClick={() => {
          const v = currentPage + 1;
          onNextPage?.(v);
          onCurrentPageChange?.(v);
        }}
      >
        <FaChevronRight />
      </button>
    </div>
  );
};
export default Pagination;
