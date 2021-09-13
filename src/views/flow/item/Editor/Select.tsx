import React, { useContext, useCallback, useMemo, memo } from "react";
import { observer } from "mobx-react-lite";
import { ItemRenderer, Select, MultiSelect, MultiSelectProps } from "@blueprintjs/select";
import { Button, Menu, MenuItem, Icon, MenuItemProps } from "@/components";
import { FixedSizeList } from "react-window";
import { SelectOption } from "@/api/bloc";
import { StoreContext as Context } from "../store";
import { noop } from "@/common";
import { ValueType } from "@/api/flow";
import classNames from "classnames";

const TypeSelect = Select.ofType<SelectOption>();

const windowHeight = window.innerHeight;

const ItemRender: ItemRenderer<SelectOption> = (option, { handleClick, modifiers }) => {
  return <MenuItem active={modifiers.active} label="asdf" onClick={handleClick} text="asdf" />;
};

const Empty = memo(() => <div className="p-5 w-80">选项为空</div>);

const Row = observer<{ index: number; style: React.CSSProperties }>(({ index, style }) => {
  const { param } = useContext(Context);
  const { atomValue, atomDescriptor } = param;
  if (!atomDescriptor) return null;
  const { select_options } = atomDescriptor;
  const value = useMemo(() => select_options?.[index], [index, select_options]);
  const select = useCallback(
    (index: number) => {
      param.updateSelectValue(select_options?.[index].value);
    },
    [param, select_options],
  );

  return (
    <MenuItem
      key={index}
      text={value?.label}
      active={atomValue === value?.value}
      style={{
        ...style,

        alignItems: "center",
      }}
      onClick={() => {
        select(index);
      }}
    />
  );
});

const MultipleSelectRow: React.FC<MenuItemProps> = ({ className, active, children, onClick, ...rest }) => {
  return (
    <MenuItem
      shouldDismissPopover={false}
      className={classNames("!items-center", className)}
      labelElement={active && <Icon icon="small-tick" />}
      active={active}
      {...rest}
    />
  );
};
const SingleSelect = observer(() => {
  const { param } = useContext(Context);
  const { atomValue, atomDescriptor, editorReadonly } = param;
  if (!atomDescriptor) return null;
  const { hint, select_options } = atomDescriptor;

  const currentValue = useMemo(() => {
    return select_options?.find((item) => item.value === atomValue)?.label || hint || "请选择";
  }, [atomValue, select_options, hint]);

  return (
    <TypeSelect
      disabled={editorReadonly}
      items={select_options || []}
      filterable={false}
      onItemSelect={noop}
      itemRenderer={ItemRender}
      itemListRenderer={(options) => {
        if (select_options?.length === 0) return <Empty />;
        return (
          <Menu>
            <FixedSizeList height={windowHeight / 2 - 100} itemCount={options.items.length} itemSize={30} width={400}>
              {Row}
            </FixedSizeList>
          </Menu>
        );
      }}
    >
      <Button text={currentValue} rightIcon="double-caret-vertical" disabled={param.editorReadonly} />
    </TypeSelect>
  );
});
type CommonSelectT = Partial<MultiSelectProps<SelectOption>> & {
  value: ValueType[] | ValueType;
  onChange?: (value: ValueType[]) => void;
  RowRenderer: React.FC<{ index: number }>;
};
export const CommonSelect: React.FC<CommonSelectT> = ({
  itemsEqual,
  tagInputProps,
  value,
  items,
  tagRenderer = (option) => option.label,
  itemRenderer = ItemRender,
  RowRenderer,
  ...rest
}) => {
  const selectedItems = useMemo(
    () => (Array.isArray(value) ? items?.filter((item) => value.includes(item.value), []) : []),
    [items, value],
  );
  console.log(items);
  return (
    <MultiSelect
      {...rest}
      items={items || []}
      onItemSelect={noop}
      tagRenderer={tagRenderer}
      itemRenderer={itemRenderer}
      selectedItems={selectedItems}
      itemListRenderer={(options) => {
        console.log(options);
        if (items?.length === 0) return <Empty />;
        return (
          <Menu>
            <FixedSizeList height={windowHeight / 2 - 100} itemCount={options.items.length} itemSize={30} width={400}>
              {RowRenderer}
            </FixedSizeList>
          </Menu>
        );
      }}
    />
  );
};

// const Hj = () => {
//   const { param } = useContext(Context);
//   const { atomValue, atomDescriptor } = param;
//   if (!atomDescriptor) return null;
//   const { select_options } = atomDescriptor;
//   const value = useMemo(() => select_options?.[index], [index, select_options]);
//   const select = useCallback(
//     (index: number) => {
//       param.updateSelectValue(select_options?.[index].value);
//     },
//     [param, select_options],
//   );

//   const active = Array.isArray(atomValue) && atomValue.includes(value?.value);
//   return <MultipleSelectRow text={} />;
// };
export const MultipleSelect = observer(() => {
  const { param } = useContext(Context);
  const { atomValue, atomDescriptor, editorReadonly } = param;
  if (!atomDescriptor) return null;
  const { hint, select_options } = atomDescriptor;
  const selectOptions = select_options || [];

  return (
    <CommonSelect
      items={selectOptions}
      fill={true}
      value={atomValue}
      onItemSelect={noop}
      placeholder={hint}
      RowRenderer={({ index }) => (
        <MultipleSelectRow
          text={selectOptions[index].label}
          active={Array.isArray(atomValue) && atomValue.includes(selectOptions[index].value)}
          onClick={() => {
            param.updateSelectValue(select_options?.[index].value);
          }}
        />
      )}
      tagInputProps={{
        disabled: editorReadonly,
        onRemove: (_, index) => {
          param.updateSelectValue(Array.isArray(atomValue) ? atomValue[index] : undefined);
        },
      }}
    />
  );
});
export default SingleSelect;