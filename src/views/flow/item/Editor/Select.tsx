import React, { useContext, useCallback, useMemo, memo } from "react";
import { observer } from "mobx-react-lite";
import { ItemRenderer, Select, MultiSelect } from "@blueprintjs/select";
import { Button, Menu, MenuItem, Icon } from "@/components";
import { FixedSizeList } from "react-window";
import { SelectOption } from "@/api/bloc";
import { StoreContext as Context } from "../store";
import { noop } from "@/common";

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

const MultipleSelectRow = observer<{ index: number; style: React.CSSProperties }>(({ index, style }) => {
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

  const active = Array.isArray(atomValue) && atomValue.includes(value?.value);
  console.log(active);
  return (
    <MenuItem
      key={index}
      shouldDismissPopover={false}
      text={value?.label}
      className="!items-center"
      labelElement={active && <Icon icon="small-tick" />}
      active={active}
      style={{
        ...style,
      }}
      onClick={() => {
        select(index);
      }}
    />
  );
});
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

export const MultipleSelect = observer(() => {
  const { param } = useContext(Context);
  const { atomValue, atomDescriptor, editorReadonly } = param;
  if (!atomDescriptor) return null;
  const { hint, select_options } = atomDescriptor;
  const selectOptions = select_options || [];
  const activeItems =
    select_options?.filter((item) => (Array.isArray(atomValue) ? atomValue.includes(item.value) : false)) || [];
  return (
    <MultiSelect
      items={selectOptions}
      fill={true}
      onItemSelect={noop}
      tagRenderer={(option) => option.label}
      itemRenderer={ItemRender}
      placeholder={hint}
      tagInputProps={{
        disabled: editorReadonly,
        onRemove: (_, index) => {
          param.updateSelectValue(activeItems[index].value);
        },
      }}
      selectedItems={activeItems}
      itemListRenderer={(options) => {
        if (selectOptions.length === 0) return <Empty />;
        return (
          <Menu>
            <FixedSizeList height={windowHeight / 2 - 100} itemCount={options.items.length} itemSize={30} width={400}>
              {MultipleSelectRow}
            </FixedSizeList>
          </Menu>
        );
      }}
    />
  );
});

export default SingleSelect;
