import { ResponseResult } from "@/shared/request";

export function updateQueryState<T>(fn: (data: T) => void) {
  return (res: ResponseResult<T>) => {
    if (res.data) {
      fn(res.data);
    }
  };
}
