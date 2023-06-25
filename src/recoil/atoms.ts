import { Mode } from "@/types/type";
import { atom } from "recoil";

export const modeAtom = atom<Mode>({
  key: "Mode",
  default: { type: "SELECT", subType: null },
});
