import request from "@/shared/request";

export const getLog = (id: string) => {
  return request.get<Log[]>(`/api/v1/function_run_record/pull_log_by_id/${id}`);
};

export interface Log {
  data: string;
  function_run_record_id: string;
  log_level: "info" | "warning" | "error";
  time: string;
  business: string;
  track_id: string;
  span_id: string;
}
