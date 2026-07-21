# engineering-devlog — agent notes

Devlog — a multi-author engineering blog on the canonical Hanzo app stack.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Forked from `hanzo-apps/hanzo-starter`; the provider stack, vite.config, auth,
and deploy contract are unchanged. Keep it REAL — every surface builds and runs.

## What it is

Team members publish technical posts with author attribution, topic tags, and
code-friendly formatting; readers browse a card grid and filter by topic or open
an author's page. Three views, no router (one static SPA, `src/views/devlog.tsx`
holds the route state):

1. **Grid** — cover-less cards (topic tag + title + excerpt + author footer),
   a topic filter bar, and a compose panel. Featured posts get a
   syntax-highlight accent bar and sort first.
2. **Post** (`views/post-detail.tsx`) — the join-derived tag set, a
   monospace-aware body (```fenced``` code → code blocks), an author footer.
3. **Author** (`views/author-page.tsx`) — every post by one member.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token, rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam scopes every
  `useQuery`/`useMutation` to the signed-in user's org.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `import.meta.env.VITE_IAM_CLIENT_ID` (fallback `hanzo-app`).
- **The look is one place** (`src/lib/theme.ts`) — the GitHub-dark palette,
  the electric-cyan accent, the monospace stack, and the pure helpers
  (`formatDate`, `parseBody`, `hueOf`, `initials`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Colors are literal values on gui color props; that is the aesthetic.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND**: `alignItems`/`justifyContent`/
  `backgroundColor`/`padding`/`alignSelf`/`borderRadius`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`self`/`rounded`/`text` shorthands. Shorthands pass
  at runtime but FAIL `tsc`. `Button` uses `onPress`; `Input` uses `value`/
  `onChangeText`. Color props take literal strings; `placeholderTextColor` does
  NOT (it wants a theme token) — leave it to the theme default.
- **PKCE storage is `localStorage`** so the verifier/state survive the round-trip
  to hanzo.id.
- **`schema.sql` is the data contract** — `posts`, `topics`, `post_topics`. It is
  the `databaseSchema` DDL the deploy translates into Base collections
  (`provisionBaseFromDDL`). Keep it in lockstep with `src/lib/types.ts` and
  `src/components/compose.tsx` (which writes all three).

## Data model

- `posts` — title, excerpt, body, author_name, topic (primary tag),
  published_at, featured.
- `topics` — name, color (themes every tag rendered for the topic).
- `post_topics` — post_id, topic_id (a post carries one or more topics). Compose
  creates the post, any missing `topics` rows, then a join row per selected
  topic; the first selected topic becomes the post's primary `topic`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app`. No server.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native, rule `@request.auth.org_id = org`). Runtime read/write
  is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_IAM_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (a `https://*.hanzo.app/auth/callback` wildcard, or a per-app
  `engineering-devlog` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · renders under Vite with zero
console errors (verified headless at 1280×800) · the signed-out hero performs a
real PKCE S256 redirect to hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
