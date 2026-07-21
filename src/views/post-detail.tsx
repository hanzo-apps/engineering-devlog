import { YStack, XStack, H1, Text, Button, Separator } from '@hanzo/gui'
import type { Post, Topic, PostTopic } from '../lib/types'
import { SURFACE, BORDER, TEXT, FAINT, CYAN, MONO, ACCENT_BAR, formatDate } from '../lib/theme'
import { TopicTag } from '../components/tag'
import { AuthorChip, Avatar } from '../components/author'
import { Body } from '../components/body'

/**
 * Full post: the join-derived tag set, a monospace-aware body, and an author
 * footer. Tags = the primary `topic` plus every topic linked through
 * `post_topics`; each is colored by its `topics` row.
 */
export function PostDetail({
  post,
  topics,
  postTopics,
  onBack,
  onAuthor,
}: {
  post: Post
  topics: Topic[]
  postTopics: PostTopic[]
  onBack: () => void
  onAuthor: (name: string) => void
}) {
  const byId = new Map(topics.map((t) => [t.id, t]))
  const colorOf = (name: string) =>
    topics.find((t) => t.name.toLowerCase() === name.toLowerCase())?.color || CYAN

  const names: string[] = []
  if (post.topic) names.push(post.topic)
  for (const pt of postTopics) {
    if (pt.post_id !== post.id) continue
    const t = byId.get(pt.topic_id)
    if (t && !names.some((n) => n.toLowerCase() === t.name.toLowerCase())) names.push(t.name)
  }

  return (
    <YStack maxWidth={760} width="100%" alignSelf="center" paddingHorizontal={24} paddingVertical={28} gap={20}>
      <Button size="$2" chromeless alignSelf="flex-start" onPress={onBack}>← All posts</Button>

      {post.featured ? (
        <XStack height={3} borderRadius={999} overflow="hidden" maxWidth={220}>
          {ACCENT_BAR.map((c, i) => (
            <YStack key={i} flexGrow={1} backgroundColor={c} />
          ))}
        </XStack>
      ) : null}

      <XStack flexWrap="wrap" gap={8}>
        {names.map((n) => (
          <TopicTag key={n} label={n} color={colorOf(n)} />
        ))}
      </XStack>

      <H1 fontSize={34} lineHeight={40} fontWeight="800" color={TEXT} letterSpacing={-0.5}>
        {post.title}
      </H1>

      <XStack alignItems="center" gap={10}>
        <AuthorChip name={post.author_name} onPress={() => onAuthor(post.author_name)} />
        <Text color={FAINT}>·</Text>
        <Text fontFamily={MONO} fontSize={12} color={FAINT}>{formatDate(post.published_at)}</Text>
      </XStack>

      <Separator borderColor={BORDER} />

      <Body body={post.body} />

      <Separator borderColor={BORDER} />

      <XStack
        alignItems="center" gap={14}
        backgroundColor={SURFACE} borderWidth={1} borderColor={BORDER} borderRadius={14} padding={18}
      >
        <Avatar name={post.author_name} size={44} />
        <YStack gap={3} flex={1}>
          <Text fontSize={11} fontFamily={MONO} color={FAINT}>WRITTEN BY</Text>
          <Text fontSize={16} fontWeight="700" color={TEXT}>{post.author_name}</Text>
        </YStack>
        <Text
          fontFamily={MONO} fontSize={12} color={CYAN} cursor="pointer"
          hoverStyle={{ opacity: 0.7 }} onPress={() => onAuthor(post.author_name)}
        >
          all posts →
        </Text>
      </XStack>
    </YStack>
  )
}
