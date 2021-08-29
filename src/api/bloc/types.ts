import { BlocId, AtomBasicValue, AtomValue, ParamTypeOptions, UserId } from "@/common";

export enum AtomSetMethod {
  input = "user_ipt",
  pair = "connection",
}

export type BlocProject = {
  /**
   * 编排id
   */
  id: number;
  /**
   * 前端用户对此编排起的整体的名字
   */
  name: string;
  /** 表示此编排的生成时间 - YYYY-MM-DD HH:MM:SS */
  create_time: string;
  /**
   * 自动任务/手动触发任务，上了任务编排才需要
   */
  flow_type: unknown;
  user_id: UserId;
  start_bloc_id: BlocId;
  /**
   * 函数bloc的信息
   */
  blocs: SourceBlocNodes;
};

type SourceComponent = {
  type: ParamTypeOptions;
  prefix: null;
  suffix: null;
  values: AtomValue;
  hint: string | null;
  allow_multi: boolean;
  options?: Array<{
    display: string;
    value: AtomBasicValue;
  }>;
};

type SourceInputParam = {
  display: string;
  key: string;
  components: SourceComponent[];
  must: boolean;
  hint: string | null;
};

type SourceOutputParam = {
  key: string;
  type: ParamTypeOptions;
  hint: string | null;
};

type InputAtom = {
  type: AtomSetMethod.input;
  value: AtomValue;
};
type PairdAtom = {
  type: AtomSetMethod.pair;
  bloc_id: BlocId;
  key: string;
};
export type SourceBlocNode = {
  /**
   * 用户自定义的显示名
   */
  user_custom_name: string;
  base_bloc_id: string;
  /**
   * 标识这个bloc的位置
   */
  position: {
    left: number;
    top: number;
  };
  /**
   * 表示当前bloc的上下游blocs
   */
  connections: {
    upstream_bloc_ids: BlocId[];
    /**
     * 同理对应（*）、可为空，表示没有下游
     */
    downstream_bloc_ids: BlocId[];
  };
  /**
   * 表示当前bloc参数入参，顺序就是按照此函数的入参顺序
   */
  param_ipts: (InputAtom | PairdAtom)[][];
  /**
   * 当前bloc的全量信息
   */
  full_bloc_info: {
    name: string;
    gorup_name: string;
    brief: string;
    /**
     * 输入/输出的配置
     */
    ipt_opt_config: {
      ipt: SourceInputParam[];
      opt: SourceOutputParam[];
    };
  };
};

export type SourceBlocNodes = Record<BlocId, SourceBlocNode>;
