/* eslint-disable indent */
import { AppAtomSetMethod, BlocNode } from "@/common";
import { AtomSetMethod, SourceBlocNodes } from "./types";

type FilterSurceNodes = (sourceNodes: SourceBlocNodes) => BlocNode[];
export const filterBlocs: FilterSurceNodes = (sourceNodes) => {
  return Object.entries(sourceNodes).map(([blocId, blocDetail]) => {
    const { name, gorup_name, ipt_opt_config, brief } = blocDetail.full_bloc_info;
    return {
      id: blocId,
      name: blocDetail.user_custom_name,
      connections: {
        upstream: blocDetail.connections.upstream_bloc_ids,
        downstream: blocDetail.connections.downstream_bloc_ids,
      },
      inputParamConf: blocDetail.param_ipts.map((atoms) =>
        atoms.map((atom) => {
          return atom.type === AtomSetMethod.input
            ? {
                type: AppAtomSetMethod.input,
                value: atom.value,
              }
            : {
                type: AppAtomSetMethod.pair,
                blocId: atom.bloc_id,
                keyName: atom.key,
              };
        }),
      ),
      position: {
        ...blocDetail.position,
      },
      function: {
        name,
        groupName: gorup_name,
        id: -1, // todo
        brief,
        input: ipt_opt_config.ipt.map(({ components, display, hint, must, key }) => {
          return {
            atoms: components.map(({ allow_multi, hint, type, prefix, suffix, values, options }) => ({
              multiple: allow_multi,
              hint,
              type,
              value: values,
              prefix,
              suffix,
              options: options ? options.map(({ display, value }) => ({ label: display, value })) : options,
            })),
            display,
            hint,
            required: must,
            keyName: key,
          };
        }),
        output: ipt_opt_config.opt.map(({ key, hint, type }) => ({
          keyName: key,
          hint,
          type,
        })),
      },
    };
  });
};
