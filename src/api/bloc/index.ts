import request from "@/shared/request";

export const getLog = (id: string) => {
  return request.get<Log[]>(`/api/v1/function_run_record/pull_log_by_id/${id}`);
};

export const getRunningInfo = (id: string) => {
  return request.get<{
    // 1-100
    progress: number;
    progress_msg: string[];
    progress_milestones: string[];
    progress_milestone_index: number;
    is_finished: boolean;
  }>(`/api/v1/function_run_record/get_progress_by_id/${id}`);
};
export interface Log {
  data: string;
  function_run_record_id: string;
  log_level: "info" | "warning" | "error";
  time: number;
  business: string;
  track_id: string;
  span_id: string;
}

{
}
