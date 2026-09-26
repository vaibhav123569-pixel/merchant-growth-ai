# Merchant Growth AI

A working hackathon application based on the supplied Merchant Growth AI presentation and product brief.

## Start on this computer

Double-click `Start-Merchant-Growth.cmd` in this folder. Keep its window open and visit http://localhost:5173/.

The local Qwen3-0.6B model and Windows CPU runtime are already downloaded in `.local-ai`. No OpenAI API key or paid AI account is required. The app's first launch can take a little time to build and load the model. Subsequent model answers typically complete in a few seconds on this computer.

If the application is already open, the launcher reuses it. Close the launcher with Ctrl+C to stop processes it started. It does not stop a server that was already running.

## Copy to another Windows x64 computer

1. Extract the project ZIP to a normal writable folder.
2. Install Node.js 22.13 or newer with npm.
3. Open a terminal in the extracted folder and run `npm ci`.
4. Double-click `Start-Merchant-Growth.cmd`.
5. Open http://localhost:5173/.

The launcher builds the app, applies local database migrations once, starts the model and starts the application. A first-time runtime/model download is needed only if `.local-ai` was not copied. The pinned model download is approximately 640 MB. Allow extra RAM for the model and development server. The bundled model runtime supports Windows x64; other platforms need their own llama.cpp runtime.

## Features

- **Smart Split Payment**: Legitimate partial invoice collections that reconcile into one consolidated invoice (avoiding MDR bypass techniques).
- **UPI Cost & MDR Intelligence**: Rule-driven estimation of UPI payment costs (e.g., distinguishing between free tiers like ₹2,000 threshold and percentage fees).
- **90 Days of Synthetic Analytics**: Generates up to 90 days of reproducible seeded data, factoring in weekends, business failures, technical declines, and refunds.
- Animated, responsive merchant dashboard with color-coded metrics and selectable hourly bars.
- Exact synthetic example: 27 afternoon payments vs a four-Saturday mean of 40; collections ₹2,700 vs ₹4,000; change -32.5%.
- Evidence drawer with dates, formula, source and limitations.
- Customer search and filters for returning, inactive and new synthetic IDs.
- Cash flow with mutually exclusive settled/pending statuses and reconciled totals.
- Real local LLM explanations with Hindi/English support, combined with server-calculated facts.
- Optional OpenAI Responses API connection, with strict structured responses and server-only secrets.
- Clearly labelled calculated fallback when model output fails validation or the provider is unavailable.
- Account registration, password sign-in, show/hide password, change password and sign-out.
- Salted PBKDF2 hashes, hashed session tokens, HttpOnly cookies, same-origin checks and sign-in throttling.
- Account-owned saved experiment drafts, approval and three-day simulated result comparisons.
- CSV exports for transactions, customers, hourly counts and evidence.
- Guided demo, loading animations, empty/error states, keyboard-accessible controls and reduced-motion support.

## Two-minute hackathon demo

1. Show Today's pulse and the 27 vs 40 afternoon insight.
2. Open the evidence and point to the four prior Saturdays: 38, 42, 39 and 41.
3. Open Ask AI and ask “Why was my afternoon slow?” Show the “Live local AI” label.
4. Switch to Hindi and ask “दोपहर में भुगतान कम क्यों थे?”
5. Click Draft an action, edit the offer and spending limit, then Save draft.
6. Use Sign in → Open a demo workspace, or register your own account. There are no hardcoded account credentials.
7. Save and approve the experiment. Enter simulated daily counts 36, 40 and 44. Their mean is 40: unchanged vs the matched baseline, and 48.1% above the original 27-payment afternoon.
8. Save outcome. Refresh, open Action lab and reopen the saved experiment.
9. Explain that a comparison describes a change and does not prove that the offer caused it.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/analytics` | Computed synthetic dashboard, customer and settlement metrics |
| GET | `/api/evidence` | Matched afternoon evidence record |
| GET | `/api/ask` | Configured model status; never returns a key |
| POST | `/api/ask` | `{ "question": "Why was my afternoon slow?", "language": "en" }` |
| GET | `/api/auth` | Current signed-in user or null |
| POST | `/api/auth` | `mode`: `register`, `login`, `logout`, `demo`, or `password` |
| GET | `/api/actions` | Current account's saved experiments |
| POST | `/api/actions` | Validate and save an account-owned draft, approval or review |

All API responses disable caching. Invalid inputs and unauthenticated writes are rejected. Registration uses `name`, `email` and a 10–128 character `password`. Password changes require `current` and `password`. Action bodies contain `id`, `title`, `offer`, integer `budget`, `status`, and `counts` (three integers or nulls). Review requires a previously approved saved action and three valid counts.

## LLM operation

The local model generates a qualitative explanation from an intent-specific summary of computed evidence. Exact figures are appended by application code. The output validator rejects malformed replies, unexpected evidence IDs, numerical inventions and common speculative sales-cause phrases. This is a bounded demo assistant, not a general-purpose chatbot; validators cannot guarantee the truth of every possible natural-language statement.

`LLM_PROVIDER=local` uses llama.cpp on `127.0.0.1:8081`. The model is Qwen3-0.6B Q8_0, from Qwen's official repository. The local server binds to loopback only. No merchant account information, password or payment record is sent to an external model in local mode.

The OpenAI adapter is included and tested with mocked provider responses. To use it, edit the ignored `.dev.vars` file:

```dotenv
LLM_PROVIDER=openai
OPENAI_API_KEY=your_own_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Restart the application. Cloud AI sends the question and synthetic aggregate evidence to OpenAI, with `store: false`. Never put API keys in client code or commit `.dev.vars`. Cloud calls are limited per IP and use a timeout with a labelled fallback. No paid cloud request was made during development.

## Validation

- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`
- `node tests/run-llm-tests.mjs` (mocked provider and validation checks)
- `node tests/live-llm-test.mjs` (requires the local model to be running)
- `python tests/api_test.py` (requires the local app on port 5173; creates isolated test accounts)

The API test checks arithmetic, Hindi/English intents, malformed requests, origin protection, registration, session cookies, duplicate registration, saved actions, approval requirements, invalid counts/budgets, account isolation, password change, session revocation, persistence after re-login and failed-login throttling. The model test distinguishes genuine local inference from mocked cloud tests.

## Files and data

Application UI: `app/MerchantApp.tsx`, `app/globals.css`.
Analytics and reproducible transactions: `lib/analytics.ts`.
LLM adapter: `lib/llm.ts`.
Account/session helpers: `lib/server.ts`.
Database schema: `db/schema.ts`; generated migrations: `drizzle/`.
Local accounts, password hashes and actions: `.wrangler/state/` (not included in the ZIP).
Model/runtime: `.local-ai/`; licenses and provenance are stored there.

The ZIP excludes personal local database state, secrets, logs, dependency caches and `node_modules`. It includes the source, migration files, model weights, runtime, tests and launcher. The source ZIP is a smaller code-only alternative; its launcher downloads the model if needed.

## Scope and deployment

All payments and customer IDs are synthetic. There is no live Paytm connection, automated messaging, email verification or email-based password recovery. A demo session expires after seven days and is lost after sign-out; use a registered account for repeat access. Demo actions do not automatically transfer to a new account.

This delivery runs locally and includes a successful production build. Live website publication has not been completed. The originally available Sites publishing helper was no longer installed during this task. A localhost model also requires a separately hosted model service or cloud provider if the application is deployed remotely. The Worker output and D1 migrations are available for a future Cloudflare/Sites deployment.

## Upstream references

- Qwen model and Apache-2.0 license: https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- llama.cpp server and MIT license: https://github.com/ggml-org/llama.cpp/tree/master/tools/server
- OpenAI structured responses: https://developers.openai.com/api/docs/guides/structured-outputs
