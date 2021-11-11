import React, { useContext, useCallback, useMemo, memo } from "react";
import { observer } from "mobx-react-lite";
import { ItemRenderer, Select, MultiSelect, MultiSelectProps } from "@blueprintjs/select";
import { Button, Menu, MenuItem, Icon, MenuItemProps } from "@/components";
import { FixedSizeList } from "react-window";
import { SelectOption } from "@/api/bloc";
import { StoreContext as Context } from "../store";
import { isTruthyValue, noop } from "@/common";
import { TruthySimpleValue } from "@/api/flow";
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

const MultipleSelectRow: React.FC<MenuItemProps & { style: React.CSSProperties }> = ({
  className,
  active,
  shouldDismissPopover = false,
  style,
  ...rest
}) => {
  return (
    <div style={style}>
      <MenuItem
        shouldDismissPopover={shouldDismissPopover}
        className={classNames("!items-center", className)}
        labelElement={active && <Icon icon="small-tick" />}
        active={active}
        {...rest}
      />
    </div>
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
            <FixedSizeList height={windowHeight / 2 - 100} itemCount={options.items.length} itemSize={34} width={400}>
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

const isActive = (index: number, value: TruthySimpleValue[], items: SelectOption[]) => {
  const isAllSelect = items[index].value === "all" && value.length === items.length - 1;
  const isSelected =
    Array.isArray(value) && isTruthyValue(items?.[index]?.value) ? value?.includes(items?.[index].value!) : false;
  return isAllSelect || isSelected;
};
export type MultiSelectT = Partial<MultiSelectProps<SelectOption>> & {
  value: TruthySimpleValue[];
  disabled?: boolean;
  onChange?: (value: TruthySimpleValue[]) => void;
};
export const CommonSelect: React.FC<MultiSelectT> = ({
  tagInputProps,
  value,
  items,
  tagRenderer = (option) => option.label,
  itemRenderer = ItemRender,
  disabled = false,
  onChange,
  children,
  ...rest
}) => {
  const selectedItems = useMemo(
    () =>
      (Array.isArray(value) ? value.map((item) => items?.find((option) => option.value === item)) : []).filter(
        isTruthyValue,
      ),
    [items, value],
  );
  return (
    <MultiSelect
      {...rest}
      items={items || []}
      onItemSelect={noop}
      tagRenderer={tagRenderer}
      itemRenderer={itemRenderer}
      selectedItems={selectedItems}
      tagInputProps={{
        disabled,
        onRemove: (v, index) => {
          onChange?.(value.filter((item) => item !== value?.[index]));
        },
        ...tagInputProps,
      }}
      itemListRenderer={(options) => {
        if (items?.length === 0) return <Empty />;
        return (
          <Menu>
            <FixedSizeList width={260} height={300} itemCount={options.items.length} itemSize={34}>
              {({ index, style, data }) => (
                <MultipleSelectRow
                  style={style}
                  text={items?.[index].label}
                  active={isActive(index, value, options.items)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!onChange) return;
                    const c = items?.[index].value;
                    let n: TruthySimpleValue[] = [];
                    if (c === "all") {
                      if (value.length === options.items.length - 1) {
                        onChange([]);
                      } else {
                        onChange(options.items.filter((item) => item.value !== "all").map((item) => item.value));
                      }
                      return;
                    }
                    if (Array.isArray(value)) {
                      let p = [...value];
                      if (isTruthyValue(c) && value.includes(c)) {
                        p = p.filter((i) => i !== c);
                      } else {
                        if (isTruthyValue(c)) {
                          p = [...p, c];
                        }
                      }
                      n = p;
                    } else {
                      if (isTruthyValue(c)) {
                        n = [c];
                      }
                    }
                    onChange(n);
                  }}
                />
              )}
            </FixedSizeList>
          </Menu>
        );
      }}
    />
  );
};

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
      value={atomValue as any}
      onItemSelect={noop}
      placeholder={hint}
      disabled={editorReadonly}
      onChange={(v) => {
        param.updateSelectValue(v);
      }}
    />
  );
});
export default SingleSelect;
