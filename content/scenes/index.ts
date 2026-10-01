import type { SceneNode } from "@/lib/types";
import chapter1 from "./chapter1.json";
import chapter2 from "./chapter2.json";
import chapter3 from "./chapter3.json";

// Add new chapters here when you upload them, e.g.:
// import chapter4 from "./chapter4.json";
// export const sceneFiles: SceneNode[][] = [chapter1, chapter2, chapter3, chapter4] ...
export const sceneFiles: SceneNode[][] = [
  chapter1 as unknown as SceneNode[],
  chapter2 as unknown as SceneNode[],
  chapter3 as unknown as SceneNode[],
];
