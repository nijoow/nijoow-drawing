type ModeType = "SELECT" | "PENCIL" | "VERTEX" | "SHAPE" | "TEXT" | null;

export interface Mode {
  type: ModeType;
  subType: string | null;
}

export interface SubToolBar {
  type: ModeType;
}

export interface Point {
  startX: number | undefined;
  startY: number | undefined;
  endX: number | undefined;
  endY: number | undefined;
}
