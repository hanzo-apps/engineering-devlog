import type { ReactNode } from 'react'
import { XStack } from '@hanzo/gui'
import type { Post } from '../lib/types'
import { PostCard } from './post-card'

/** A responsive, wrapping grid of post cards (shared by the grid + author page). */
export function PostList({
  posts,
  colorFor,
  onOpen,
  onAuthor,
  empty,
}: {
  posts: Post[]
  colorFor: (topic: string) => string
  onOpen: (id: string) => void
  onAuthor: (name: string) => void
  empty?: ReactNode
}) {
  if (posts.length === 0) return <>{empty ?? null}</>
  return (
    <XStack flexWrap="wrap" gap={16}>
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          topicColor={colorFor(p.topic)}
          onOpen={() => onOpen(p.id)}
          onAuthor={() => onAuthor(p.author_name)}
        />
      ))}
    </XStack>
  )
}
