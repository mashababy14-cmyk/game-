# Characters — AI girls

Source uploads live in `content/carecter content/ai girl/` (original drop).
Web-served copies live in `public/media/characters/ai/`:

- `girl1.jpg` … `girl105.jpg` — **photo = chat**
- `girlv1.mp4` … `girlv15.mp4` — **video = sex**

Rules enforced in `src/lib/content.ts`:

- `sceneMode()` → `chat` uses `characterPhoto()`, `sex`/`intimate:true` uses `characterVideo()`
- `mediaForScene()` → scene `photo`/`video` wins, else character fallback
- All characters flagged `"ai": true` — no real person. UI shows an “AI” badge.
