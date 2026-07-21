# Devlog — Team Engineering Blog

**How we build, in the open.** A multi-author engineering blog on the canonical
Hanzo app stack — a real, buildable app you fork on [hanzo.app](https://hanzo.app)
and deploy live on Hanzo Cloud.

Team members publish technical posts with author attribution, topic tags, and
code-friendly formatting; readers browse a card grid, filter by topic, open a
post, or view everything by one author.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. A GitHub-dark aesthetic: near-black
  canvas, hairline card grid, electric-cyan topic tags, and a syntax-highlight
  accent bar on featured posts — 100% gui primitives, no Tailwind, no second kit.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Posts, topics, and their join are real Base
  collections provisioned from [`schema.sql`](./schema.sql).

## Views

- **Grid** — cover-less cards (topic tag · title · excerpt · author footer) with
  a topic filter bar and a compose panel. Featured posts sort first and wear a
  syntax-highlight accent bar.
- **Post** — the full body with monospace code blocks (fence with ```) and an
  author footer; tags come from the post's primary topic plus the join.
- **Author** — every post by one member.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the sign-in flow. Copy `.env.example` to `.env` to point at
a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_IAM_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback`. A per-app `engineering-devlog` client is provisioned at deploy. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base.

The one deploy requirement: the IAM client (`VITE_IAM_CLIENT_ID`) must list this
origin's `/auth/callback` as an allowed redirect URI (a
`https://*.hanzo.app/auth/callback` wildcard on the shared client, or a dedicated
`engineering-devlog` client).

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org (rule
`@request.auth.org_id = org`). At runtime the views read/write the collections
through `@hanzo/base/react` (`useQuery`/`useMutation`) carrying the IAM token.

| Collection | Columns |
| --- | --- |
| `posts` | title, excerpt, body, author_name, topic, published_at, featured |
| `topics` | name, color |
| `post_topics` | post_id, topic_id |

Keep `schema.sql` in lockstep with `src/lib/types.ts`.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx            entry
  providers.tsx       GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx             route (/auth/callback) + auth gate
  gui.config.ts       createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts       IAM PKCE config
  env.ts              the VITE_ env contract, one place
  lib/
    base.ts           BaseClient carrying the IAM bearer token
    theme.ts          the palette + pure helpers (formatDate, parseBody, …)
    types.ts          Post · Topic · PostTopic
  auth/callback.tsx   PKCE return leg
  components/         tag · author · body · post-card · post-list · compose
  views/              signed-out (hero) · devlog (shell+grid) · post-detail · author-page
schema.sql            databaseSchema -> Base collections on publish
hanzo.yml             Hanzo Cloud build/deploy manifest
```
