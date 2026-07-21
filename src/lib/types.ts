import type { BaseRecord } from '@hanzo/base/react'

/**
 * The three collections provisioned from schema.sql. Base manages
 * id/created/updated/owner/org; these interfaces declare only the app's columns.
 * Keep them in lockstep with schema.sql and what the views read/write.
 */

/** A published engineering post. `topic` is the primary tag shown on the card. */
export interface Post extends BaseRecord {
  title: string
  excerpt: string
  body: string
  author_name: string
  topic: string
  published_at: string
  featured: boolean
}

/** A topic in the catalog — its `color` themes every tag rendered for it. */
export interface Topic extends BaseRecord {
  name: string
  color: string
}

/** Join row: a post carries one or more topics (many-to-many). */
export interface PostTopic extends BaseRecord {
  post_id: string
  topic_id: string
}
