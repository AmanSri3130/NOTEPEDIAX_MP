# NotepediaX · AI Doubt Solver

Chat-style doubt solver: streaming answers from Groq, Markdown + KaTeX + highlighted code, image doubts, notes context, per-user history. Next.js (App Router) + Tailwind + `groq-sdk`.

## Folder structure

```
app/
  api/doubt/route.js      POST /api/doubt – validation, rate limit, model routing, Groq streaming
  layout.js  page.js  globals.css
components/
  ChatApp.js              top-level UI, theme, notes-context bridge, auto-scroll
  Composer.js             sticky input, image upload/preview, voice, send/stop
  MessageBubble.js        bubbles + copy / regenerate / feedback / save-to-notes
  Markdown.js CodeBlock.js  rich rendering (GFM tables, KaTeX, highlight + copy)
  Sidebar.js Welcome.js Selectors.js Toasts.js Icons.js
hooks/
  useChat.js              state, streaming, abort, regenerate, persistence
  useSpeech.js            Web Speech API dictation
lib/
  config.js               MODELS, generation settings, limits  ← edit models here
  systemPrompt.js         ← PASTE NOTEPEDIAX SYSTEM PROMPT HERE
  groq.js rateLimit.js sanitize.js storage.js notes.js image.js
scripts/test-api.mjs      backend smoke tests
.env.example
```

## Setup

```bash
npm install
cp .env.example .env.local      # Windows: copy .env.example .env.local
# put your key in .env.local  ->  GROQ_API_KEY=...
npm run dev                     # http://localhost:3000
npm run test:api                # backend smoke tests (dev server must be running)
```

The key is read only in server code (`process.env.GROQ_API_KEY`); it is never sent to the browser.

## Deploy (Vercel)

1. Push to GitHub → "Import Project" on vercel.com.
2. Add env var `GROQ_API_KEY` (Production + Preview).
3. Deploy. Notes: the in-memory rate limiter is per-instance on serverless; for strict global limits swap `lib/rateLimit.js` for Upstash Redis. Images are downscaled client-side to stay under Vercel's 4.5 MB body limit.

(Render/Railway: build `npm run build`, start `npm start`, set `GROQ_API_KEY`.)

## NotepediaX integration

- **Notes context**: `?notes=<text>`, `window.NOTEPEDIAX_NOTES_CONTEXT`, or `postMessage({type:'NOTEPEDIAX_NOTES_CONTEXT', notes})` (same-origin / referrer origin only). Sent as a separate `[NOTES_CONTEXT]` message.
- **Per-user history**: `?uid=<userId>` namespaces localStorage. Swap `lib/storage.js` for DB calls later.
- **Save to my notes**: `lib/notes.js` stores locally and emits a `notepediax:save-note` window event (+ `postMessage` to parent). Replace its body with a call to your notes API.
- **Feedback** (👍/👎) is stored in localStorage (`npx_feedback_v1`).

## Testing checklist

| # | Doubt | Expected |
|---|-------|----------|
| 1 | Math: "Solve 2x² − 5x + 3 = 0" (subject Math) | Larger model; numbered steps; KaTeX rendered; roots x=1, 3/2 |
| 2 | Physics: "Ball thrown up at 20 m/s, max height? g=10" | Formula + substitution + units; answer 20 m |
| 3 | Coding: "Reverse a string in Python" | Fenced `python` block, highlighted, Copy button works |
| 4 | Theory: "What is photosynthesis?" (Auto) | Short definition → fast model (check `X-Model-Used` header) |
| 5 | Wrong attempt: "I solved 2+3×4 = 20, why is the book saying 14?" | Points out order of operations, shows fix |
| 6 | Hinglish: "Bhai Newton ka third law simple mein samjhao" | Reply in simple Hinglish |
| 7 | Image: upload photo of a printed question, send with empty text | Preview shown; vision model reads and solves it; >5 MB or non-JPG/PNG rejected with toast |
| 8 | Follow-up: after #1 tap "Explain that in simpler words" | Uses history; simpler wording of same problem |
| 9 | Edge: empty send / 5000 chars / double-click Send / Stop mid-answer | Toast for empty; input capped at 4000; one request only; partial answer kept with "Generation stopped" |
| 10 | Edge: Wi-Fi off mid-stream; then 21+ quick requests | "Connection lost" toast + partial kept + Try again; 21st request → friendly rate-limit message |
