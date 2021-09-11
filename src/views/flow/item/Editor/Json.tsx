import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import JsonEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import { Nullable } from "@/common";
import { StoreContext as Context } from "../store";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Button } from "@blueprintjs/core";

export const Json: React.FC<{ index?: number }> = observer(({ index = -1, ...rest }) => {
  const ref = useRef<Nullable<HTMLDivElement>>(null);
  const [editor, setEditor] = useState<JsonEditor | null>(null);
  const { param } = useContext(Context);
  const { atomValue } = param;
  const [content] = useState("");
  const getValue = useCallback(() => {
    try {
      return typeof param.atomValue === "string" ? JSON.parse(param.atomValue) : {};
    } catch (error) {
      return {};
    }
  }, [param.atomValue]);
  useEffect(() => {
    if (!ref.current) return;
    const editor = new JsonEditor(ref.current, {
      search: false,
      history: false,
      navigationBar: false,
      mainMenuBar: false,
      enableTransform: false,
      mode: "code",
      modes: ["code", "view"],
      onChange: () => {
        param.updateInputFieldValue(editor.getText(), index);
      },
    });
    const value = (Array.isArray(atomValue) ? atomValue[index] : atomValue) ?? "";
    if (typeof value !== "string") return;
    if (value) editor.set(JSON.parse(value));
    setEditor(editor);
    const disposer = reaction(
      () => param.editorReadonly,
      (readonly) => {
        editor.setMode(readonly ? "view" : "code");
      },
    );
    return () => {
      disposer();
    };
  }, [param, atomValue, index]);
  return (
    <div
      {...rest}
      ref={ref}
      style={{
        height: 600,
      }}
    ></div>
  );
});

export default Json;

export const JsonInput = observer(() => {
  const swiper = useRef<Nullable<SwiperCore>>(null);
  const { param } = useContext(Context);
  const { atomDescriptor, editorReadonly, atomValue } = param;
  const [index, setIndex] = useState(0);
  // if (atomDescriptor?.formcontrol_type !== FormControlType.json) return null; // TODO
  const realAtomValue = atomValue || (atomDescriptor?.allow_multi ? [] : "");
  if (typeof realAtomValue == "number" || typeof realAtomValue === "boolean" || !Array.isArray(realAtomValue))
    return null;
  const deleteItem = useCallback(() => {
    param.removeAtomItem(index);
  }, [param, index]);
  const addItem = useCallback(() => {
    param.addAtomItem();
    Promise.resolve().then(() => {
      swiper.current?.slideNext();
    });
  }, [param]);
  return (
    <div className="relative">
      <div className="mb-5 flex">
        <Button
          icon="chevron-left"
          disabled={index <= 0}
          className="mr-auto ml-0"
          onClick={() => {
            swiper.current?.slidePrev();
          }}
        >
          上一项
        </Button>

        {!editorReadonly && realAtomValue.length > 0 && (
          <Button icon="trash" intent="danger" outlined onClick={deleteItem}>
            删除此项
          </Button>
        )}
        {index >= realAtomValue.length - 1 ? (
          <Button icon="plus" intent="primary" className="ml-3" disabled={editorReadonly} onClick={addItem}>
            添加一项
          </Button>
        ) : (
          <Button
            rightIcon="chevron-right"
            className="ml-3"
            onClick={() => {
              swiper.current?.slideNext();
            }}
          >
            下一项
          </Button>
        )}
      </div>
      <Swiper
        spaceBetween={20}
        pagination={true}
        slidesPerView={1}
        preventClicks={false}
        preventClicksPropagation={false}
        touchStartForcePreventDefault={false}
        onSlideChange={(swiper) => {
          setIndex(swiper.activeIndex);
        }}
        onSwiper={(swiperInstance) => {
          swiper.current = swiperInstance;
        }}
      >
        {realAtomValue.map((atom, index) => (
          <SwiperSlide key={index}>
            <div className="min-h-20">
              <Json index={index} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});
