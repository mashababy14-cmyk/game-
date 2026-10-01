# Late Night — architecture

Next.js static export + file-based content. No server, no database, no network.
`npm run build` → `out/`, open it anywhere (or serve with any static server).

## Run

```bash
npm install
npm run dev     # develop at :3000
npm run build   # offline build -> out/
```

## Screens

| Route      | What it is                                             |
| ---------- | ------------------------------------------------------ |
| `/`        | Title: new / continue / saves / settings (icon only)    |
| `/game`    | Story: phone strip, media, choices, dialogue box       |
| `/map`     | Map board: placed nodes, links, locks, travel          |
| `/shop`    | Pharmacy: buy + use items                              |
| `/status`  | Status phone: rings, people, bag, log                  |
| `/saves`   | 6 manual slots, autosave, JSON export/import           |
| `/settings`| Accent, text, interface, characters, reset             |

## Map

`content/map.json`:

```json
{
  "locations": [
    { "id": "roof", "label": "Rooftop", "icon": "cloud", "zone": "3rd floor",
      "x": 80, "y": 22, "sceneId": "c1_roof",
      "unlock": { "meter": "trust", "gte": 45 } },
    { "id": "pharmacy", "label": "Pharmacy", "x": 12, "y": 20, "page": "/shop" }
  ],
  "links": [{ "from": "pharmacy", "to": "stairwell" }]
}
```

- `x` / `y` = 0-100 position on the board. `zone` = floor label.
- `links` draw the connectors; links touching your current location light up.
- Scenes declare `"location": "roof"` so the map knows where you are (the node
  gets a pulsing dot + ring).
- `unlock` uses the same condition system as choices. Locked nodes show the
  requirement (`Trust ≥ 45`, `Stress ≤ 40`, …) and Travel stays disabled.
- A location with `page` opens that screen instead of a scene (pharmacy → shop).

## Status phone

- Phone shell: notch, status bar (clock + day + coins + signal/battery), home bar.
- **Status** tab: ring meters (SVG arcs), day/time/coins block, quick links.
- **People** tab: every character with editable name + relationship, event list.
- **Bag** tab: inventory with use buttons, coin balance, link to pharmacy.
- **Log** tab: current location + the last 14 story/choice lines.
- Ring meters in `components/ui/Ring.tsx`; positive meters use the accent
  gradient, negative ones (stress) go amber→red.

## Folder map

```
content/                 <- YOU upload story here (JSON only)
  meta.json              title, startingMoney, firstSceneId, startTime
  characters.json        mc + ayesha (+ narrator), editable fields
  meters.json            affection, trust, stress (icon, min/max/initial)
  map.json               locations, icon, unlock condition, travel time
  items.json             item catalog + effects
  shop.json              stock: itemId, price, repeat
  scenes/
    index.ts             <- register chapters here
    chapter1.json        your story (uploaded)
public/media/
  photos/                scene photos, e.g. /media/photos/living_room_night.jpg
  videos/                scene videos, e.g. /media/videos/xxx.mp4
src/
  app/                   routes above
  components/
    ui/                  Icon, IconButton, Controls (Switch/Slider/Segmented)
    dialogue/            DialogueBox (typewriter), ChoiceList
    hud/                 NavRail, MeterChips, StatusPhone, HistoryPanel
  engine/                runner, effects, conditions, shop, saves, save
  store/gameStore.ts     zustand + persist (autosave to localStorage)
  lib/                   types, content loader, presets, useReady
```

## Script format (scenes/*.json)

Array of nodes:

```json
[
  {
    "id": "c1_open",
    "photo": "/media/photos/living_room_night.jpg",
    "video": "/media/videos/optional.mp4",
    "time": { "tod": "night", "advanceDays": 1 },
    "lines": [
      { "speaker": "narrator", "text": "..." },
      { "speaker": "ayesha", "text": "..." }
    ],
    "choices": [
      {
        "text": "...",
        "condition": { "meter": "trust", "gte": 45 },
        "effects": { "affection": 10, "trust": 8, "stress": -4 },
        "goto": "c1_next"
      }
    ]
  }
]
```

- `speaker`: character id or `"narrator"`.
- `condition` (optional): `meter` + `gte`/`lte`, `flag` + `flagValue`,
  `item` + `itemCount`, `day`, `tod`.
- `effects` (optional), **flat meter map**:
  `{ "affection": 10, "trust": 8, "money": -50, "flags": {...}, "addItems": {...} }`
  — nested form also works: `{ "meters": { "affection": 10 } }`.
- `goto`: next node id. No choices + no goto = chapter end.
- New chapter: drop the file in `scenes/`, add one import in `scenes/index.ts`.

## Design system

- Backgrounds: pure CSS gradients (`globals.css`), no images.
- Darkish palette via CSS vars: `--bg-0/--bg-1`, `--panel`, `--line`,
  `--ink`, `--muted`, `--accent` + `--accent-2`.
- Minimal icon UI: all navigation is `IconButton` / `NavRail` (inline SVG,
  no icon dependency, no text labels), 40px touch targets.
- Shared classes: `.panel`, `.ibtn`, `.btn`, `.field`, `.meter-track`,
  `.meter-fill`, `.label`, `.dtext`.

## Settings (all applied live)

- Accent presets (6) → writes `--accent` / `--accent-2`
- Typewriter speed, auto-advance delay, font size, history length
- Tap-anywhere-to-advance, meter icons, animations
- Character name / relationship / gender per character (`editable` in
  `characters.json` decides which fields show)
- Reset: clears autosave, slots, names, progress

## Save system

- **Autosave**: whole run in `localStorage["story-save-v1"]` on every change.
- **Slots**: 6 manual copies in `localStorage["story-slots-v1"]`.
- **Export/import**: slot → JSON file download / file upload, so saves move
  between phones. Import validates before writing.
- Snapshot shape = `Snapshot` in `src/lib/types.ts` — add fields there and
  old saves still load (missing fields fall back to defaults).
