import { useState, type ReactNode } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, ScrollView, Text, Button, Paragraph, Spinner } from '@hanzo/gui'
import type { Post, Topic, PostTopic } from '../lib/types'
import {
  CANVAS, SURFACE, RAISED, BORDER, TEXT, MUTED, FAINT, CYAN, CYAN_BORDER, MONO,
} from '../lib/theme'
import { TopicTag } from '../components/tag'
import { PostList } from '../components/post-list'
import { Compose } from '../components/compose'
import { PostDetail } from './post-detail'
import { AuthorPage } from './author-page'

type Route =
  | { name: 'grid' }
  | { name: 'post'; id: string }
  | { name: 'author'; author: string }

function toTop() {
  if (typeof window !== 'undefined') window.scrollTo(0, 0)
}

/**
 * The signed-in shell. Loads the three collections once, resolves topic colors,
 * and routes between the grid, a post, and an author page — no router dependency,
 * one static SPA. Compose writes flow back through the same queries via refetch.
 */
export function Devlog() {
  const { user, logout } = useIam()
  const author = user?.displayName || user?.name || user?.email || 'you'

  const posts = useQuery<Post>('posts', { sort: '-published_at', realtime: false })
  const topics = useQuery<Topic>('topics', { sort: 'name', realtime: false })
  const links = useQuery<PostTopic>('post_topics', { realtime: false })

  // Newest-first comes from the query; lift featured posts to the top (a stable
  // sort keeps date order within each group) without relying on Base multi-sort.
  const ordered = [...posts.data].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))

  const [route, setRoute] = useState<Route>({ name: 'grid' })
  const [composing, setComposing] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  const colorFor = (topic: string) =>
    topics.data.find((t) => t.name.toLowerCase() === topic.toLowerCase())?.color || CYAN

  const openPost = (id: string) => { setRoute({ name: 'post', id }); toTop() }
  const openAuthor = (name: string) => { setRoute({ name: 'author', author: name }); toTop() }
  const back = () => { setRoute({ name: 'grid' }); toTop() }

  async function onCreated(postId: string) {
    setComposing(false)
    await Promise.all([posts.refetch(), links.refetch()])
    openPost(postId)
  }

  function write() { setRoute({ name: 'grid' }); setComposing(true); toTop() }

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={CANVAS}>
      <XStack borderBottomWidth={1} borderColor={BORDER} backgroundColor={CANVAS}>
        <XStack width="100%" maxWidth={1040} alignSelf="center" alignItems="center" justifyContent="space-between" paddingHorizontal={24} paddingVertical={14}>
          <XStack alignItems="center" gap={10} cursor="pointer" onPress={back}>
            <YStack width={30} height={30} borderRadius={8} backgroundColor={RAISED} borderWidth={1} borderColor={CYAN_BORDER} alignItems="center" justifyContent="center">
              <Text fontFamily={MONO} fontSize={12} fontWeight="800" color={CYAN}>{'</>'}</Text>
            </YStack>
            <Text fontSize={17} fontWeight="800" color={TEXT} letterSpacing={-0.3}>devlog</Text>
          </XStack>
          <XStack alignItems="center" gap={14}>
            <Text fontFamily={MONO} fontSize={12} color={FAINT}>{author}</Text>
            <Button size="$3" theme="active" onPress={write}>Write</Button>
            <Button size="$3" chromeless onPress={() => logout()}>Sign out</Button>
          </XStack>
        </XStack>
      </XStack>

      {route.name === 'grid' ? (
        <Grid
          posts={ordered}
          topics={topics.data}
          isLoading={posts.isLoading}
          error={posts.error}
          filter={filter}
          setFilter={setFilter}
          colorFor={colorFor}
          onOpen={openPost}
          onAuthor={openAuthor}
          onWrite={write}
          composing={composing}
          compose={
            <Compose
              authorName={author}
              topics={topics.data}
              onCreated={onCreated}
              onClose={() => setComposing(false)}
              refetchTopics={topics.refetch}
            />
          }
        />
      ) : route.name === 'author' ? (
        <AuthorPage
          author={route.author}
          posts={ordered}
          colorFor={colorFor}
          onBack={back}
          onOpen={openPost}
          onAuthor={openAuthor}
        />
      ) : (
        <PostRoute id={route.id} posts={posts.data} topics={topics.data} links={links.data} onBack={back} onAuthor={openAuthor} />
      )}
    </YStack>
  )
}

/** Resolve a post id → detail, or fall back to the grid if it's gone. */
function PostRoute({
  id, posts, topics, links, onBack, onAuthor,
}: {
  id: string
  posts: Post[]
  topics: Topic[]
  links: PostTopic[]
  onBack: () => void
  onAuthor: (name: string) => void
}) {
  const post = posts.find((p) => p.id === id)
  if (!post) {
    return (
      <YStack maxWidth={760} width="100%" alignSelf="center" padding={40} gap={12}>
        <Paragraph color={MUTED}>That post isn't here anymore.</Paragraph>
        <Button size="$3" alignSelf="flex-start" onPress={onBack}>← All posts</Button>
      </YStack>
    )
  }
  return <PostDetail post={post} topics={topics} postTopics={links} onBack={onBack} onAuthor={onAuthor} />
}

function Grid({
  posts, topics, isLoading, error, filter, setFilter, colorFor, onOpen, onAuthor, onWrite, composing, compose,
}: {
  posts: Post[]
  topics: Topic[]
  isLoading: boolean
  error: Error | null
  filter: string | null
  setFilter: (t: string | null) => void
  colorFor: (topic: string) => string
  onOpen: (id: string) => void
  onAuthor: (name: string) => void
  onWrite: () => void
  composing: boolean
  compose: ReactNode
}) {
  const names = Array.from(
    new Set([...topics.map((t) => t.name), ...posts.map((p) => p.topic).filter(Boolean)]),
  )
  const shown = filter ? posts.filter((p) => p.topic?.toLowerCase() === filter.toLowerCase()) : posts

  return (
    <YStack width="100%" maxWidth={1040} alignSelf="center" paddingHorizontal={24} paddingVertical={24} gap={20}>
      {composing ? compose : null}

      {names.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap={8} paddingVertical={2}>
            <TopicTag label="all" color={CYAN} active={filter === null} onPress={() => setFilter(null)} />
            {names.map((n) => (
              <TopicTag key={n} label={n} color={colorFor(n)} active={filter?.toLowerCase() === n.toLowerCase()} onPress={() => setFilter(n)} />
            ))}
          </XStack>
        </ScrollView>
      ) : null}

      {isLoading ? (
        <XStack gap={10} alignItems="center" paddingVertical={40} justifyContent="center">
          <Spinner /> <Text color={MUTED}>Loading the log…</Text>
        </XStack>
      ) : error ? (
        <Paragraph color="#ff7b72">
          Couldn't reach Base ({error.message}). Confirm you're signed in and VITE_HANZO_BASE_URL is set.
        </Paragraph>
      ) : (
        <PostList
          posts={shown}
          colorFor={colorFor}
          onOpen={onOpen}
          onAuthor={onAuthor}
          empty={
            <YStack
              alignItems="center" gap={14} paddingVertical={56}
              backgroundColor={SURFACE} borderWidth={1} borderColor={BORDER} borderRadius={16}
            >
              <Text fontFamily={MONO} fontSize={13} color={CYAN}>{'// the log is empty'}</Text>
              <Text fontSize={20} fontWeight="800" color={TEXT}>
                {filter ? `No posts tagged ${filter}.` : 'Write the first post.'}
              </Text>
              <Paragraph fontSize={14} color={MUTED} textAlign="center" maxWidth={420}>
                Posts are stored per-org in Hanzo Base. Publish one and it appears
                here for everyone on your team.
              </Paragraph>
              {!filter ? <Button theme="active" onPress={onWrite}>Write a post</Button> : null}
            </YStack>
          }
        />
      )}
    </YStack>
  )
}
