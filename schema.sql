-- Devlog — Hanzo Base schema (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped — the access rule is `@request.auth.org_id = org` on list/view/
-- create/update/delete, so a member of your org reads/writes it and other orgs
-- cannot see it.
--
-- Keep this file in lockstep with src/lib/types.ts and what the views read/write
-- (posts, topics, post_topics).

-- Published engineering posts. `topic` is the primary tag shown on the card;
-- `featured` lifts a post to the top with the syntax-highlight accent bar.
CREATE TABLE IF NOT EXISTS posts (
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  author_name  TEXT NOT NULL DEFAULT '',
  topic        TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL DEFAULT '',
  featured     BOOLEAN NOT NULL DEFAULT 0
);

-- Topic catalog. `color` themes every tag rendered for the topic.
CREATE TABLE IF NOT EXISTS topics (
  name  TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#22d3ee'
);

-- Join: a post carries one or more topics (many-to-many).
CREATE TABLE IF NOT EXISTS post_topics (
  post_id  TEXT NOT NULL,
  topic_id TEXT NOT NULL
);
