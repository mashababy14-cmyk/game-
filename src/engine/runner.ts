import { scenesById } from "@/lib/content";
import { applyEffects } from "@/engine/effects";
import type {
  Choice,
  HistoryLine,
  SceneNode,
  TimeOfDay,
} from "@/lib/types";

export interface EngineState {
  sceneId: string;
  lineIndex: number;
  meters: Record<string, number>;
  flags: Record<string, boolean>;
  money: number;
  inventory: Record<string, number>;
  history: HistoryLine[];
  ended: boolean;
  day: number;
  tod: TimeOfDay;
}

let historyLimit = 300;
export function setHistoryLimit(n: number) {
  historyLimit = n;
}

function pushHistory(h: HistoryLine[], entry: HistoryLine): HistoryLine[] {
  return [...h, entry].slice(-historyLimit);
}

export function currentScene(
  s: Pick<EngineState, "sceneId">,
): SceneNode | undefined {
  return scenesById[s.sceneId];
}

export function isAwaitingChoice(
  s: Pick<EngineState, "sceneId" | "lineIndex">,
): boolean {
  const scene = scenesById[s.sceneId];
  if (!scene || !scene.choices || scene.choices.length === 0) return false;
  return s.lineIndex >= scene.lines.length;
}

function goToScene(
  base: EngineState,
  targetId: string,
  history: HistoryLine[],
): EngineState {
  const target = scenesById[targetId];
  if (!target) {
    console.warn(`[engine] missing scene: ${targetId}`);
    return { ...base, history, ended: true };
  }
  return {
    ...base,
    sceneId: targetId,
    lineIndex: 0,
    history,
    ended: false,
    day: base.day + (target.time?.advanceDays ?? 0),
    tod: target.time?.tod ?? base.tod,
  };
}

export function advance(s: EngineState): EngineState {
  const scene = scenesById[s.sceneId];
  if (!scene || s.ended) return s;
  if (isAwaitingChoice(s)) return s;
  const line = scene.lines[s.lineIndex];
  const history = line
    ? pushHistory(s.history, { speaker: line.speaker, text: line.text })
    : s.history;
  if (s.lineIndex + 1 < scene.lines.length)
    return { ...s, lineIndex: s.lineIndex + 1, history };
  if (scene.choices && scene.choices.length > 0)
    return { ...s, lineIndex: scene.lines.length, history };
  if (scene.goto) return goToScene(s, scene.goto, history);
  return { ...s, history, ended: true };
}

export function choose(s: EngineState, choice: Choice): EngineState {
  const scene = scenesById[s.sceneId];
  if (!scene || s.ended) return s;
  const history = pushHistory(s.history, {
    speaker: "choice",
    text: choice.text,
  });
  const eff = applyEffects(choice.effect ?? choice.effects, {
    meters: s.meters,
    flags: s.flags,
    money: s.money,
    inventory: s.inventory,
    day: s.day,
    tod: s.tod,
  });
  return goToScene({ ...s, ...eff, history }, choice.goto, history);
}

/** Fallback when a scene has choices but all are locked: follow goto or end. */
export function fallbackContinue(s: EngineState): EngineState {
  const scene = scenesById[s.sceneId];
  if (!scene || s.ended) return s;
  if (scene.goto) return goToScene(s, scene.goto, s.history);
  return { ...s, ended: true };
}
