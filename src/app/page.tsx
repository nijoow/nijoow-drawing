"use client";

import React, { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { modeAtom } from "@/recoil/atoms";
import SideToolBar from "@/components/SideToolBar";
import { Point } from "@/types/type";
import { v4 as uuid } from "uuid";
import {
  getHeightFromPoint,
  getLeftFromPoint,
  getTopFromPoint,
  getWidthFromPoint,
} from "@/utils/getValueFromPoint";

const defaultPoint = {
  startX: undefined,
  startY: undefined,
  endX: undefined,
  endY: undefined,
};

export default function Home() {
  const [mode, setMode] = useRecoilState(modeAtom);
  const [drawings, setDrawings] = useState<any[]>([]);
  const isDragged = useRef(false);
  const [point, setPoint] = useState<Point>(defaultPoint);

  const handleMouseDown = (event: React.MouseEvent) => {
    isDragged.current = true;
    setPoint({ ...point, startX: event.clientX, startY: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragged.current) return;
    setPoint({
      ...point,
      endX: event.clientX,
      endY: event.clientY,
    });
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDragged.current) return;

    isDragged.current = false;
    if (
      mode.type === "SHAPE" &&
      point.startX &&
      point.startY &&
      point.endX &&
      point.endY
    ) {
      const centerX = (point.startX + point.endX) / 2;
      const centerY = (point.startY + point.endY) / 2;
      const width = Math.abs(point.endX - point.startX);
      const height = Math.abs(point.endY - point.startY);

      setDrawings([
        ...drawings,
        { id: uuid(), center: { x: centerX, y: centerY }, width, height },
      ]);
    }

    setPoint(defaultPoint);
    setMode({ type: null, subType: null });
  };

  return (
    <main className="w-full h-full flex items-center">
      <SideToolBar />
      <div
        className="bg-white h-full w-full z-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {drawings.map((drawing) => (
          <svg
            key={drawing.id}
            viewBox={`0 0 ${drawing.width} ${drawing.height}`}
            width={drawing.width}
            height={drawing.height}
            style={{
              left: drawing.center.x - drawing.width / 2,
              top: drawing.center.y - drawing.height / 2,
              position: "absolute",
            }}
          >
            <rect
              x={0}
              y={0}
              fill="black"
              width={drawing.width}
              height={drawing.height}
            />
          </svg>
        ))}
      </div>
      {isDragged.current && (
        <div
          className="border border-blue-500 absolute"
          style={{
            left: getLeftFromPoint(point),
            top: getTopFromPoint(point),
            width: getWidthFromPoint(point),
            height: getHeightFromPoint(point),
            pointerEvents: "none",
          }}
        ></div>
      )}
    </main>
  );
}
