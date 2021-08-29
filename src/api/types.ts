export interface LoginForm {
  name: string;
  password: string;
}

export interface Data {
  id: string;
  name: string;
  crontab: string;
  trigger_key: string;
  arrangement_flows: ArrangementFlows;
  create_user_name: string;
  read: boolean;
  write: boolean;
  execute: boolean;
  create_time: string;
}

export type ArrangementFlows = Record<string, ArrangementFlowItem>;

export interface ArrangementFlowItem {
  flow_id: string;
  retry_amount: number;
  retry_interval_in_second: number;
  stop_if_fail: boolean;
  upstream_flow_ids: string[] | null;
  downstream_flow_ids: string[] | null;
}
