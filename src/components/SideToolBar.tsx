"use client";

import { useEffect, useState } from "react";
import { RiCursorFill, RiPencilFill, RiPenNibFill } from "react-icons/ri";
import { IoShapes, IoText } from "react-icons/io5";
import { useRecoilState } from "recoil";
import { modeAtom } from "@/recoil/atoms";
import { SubToolBar } from "@/types/type";

export default function SideToolBar() {
  const [mode, setMode] = useRecoilState(modeAtom);
  const [openSubToolBar, setOpenSubToolBar] = useState<SubToolBar>({
    type: null,
  });

  return (
    <div className="flex flex-col justify-center items-center left-4 fixed gap-2 bg-gray-600 text-white min-h-fit w-16 py-2 z-10 rounded-lg overflow-visible">
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: "SELECT", subType: "" })}
      >
        <RiCursorFill size={20} />
      </button>
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: "PENCIL", subType: "" })}
      >
        <RiPencilFill size={20} />
      </button>
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: "VERTEX", subType: "" })}
      >
        <RiPenNibFill size={20} />
      </button>
      <div className="flex items-center justify-center relative w-full py-2">
        <button
          type="button"
          onClick={() => setOpenSubToolBar({ type: "SHAPE" })}
        >
          <IoShapes size={20} />
        </button>
        {openSubToolBar.type === "SHAPE" && (
          <div className="flex absolute left-full top-0 bg-red-500 ">
            <button
              type="button"
              className="p-2"
              onClick={() => {
                setMode({ type: "SHAPE", subType: "RECTANGLE" });
                setOpenSubToolBar({ type: null });
              }}
            >
              <IoShapes size={20} />
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        className="p-2"
        onClick={() => setMode({ type: "TEXT", subType: "" })}
      >
        <IoText size={20} />
      </button>
    </div>
  );
}
