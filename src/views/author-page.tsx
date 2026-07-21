import { YStack, XStack, H2, Text, Button, Paragraph, Separator } from '@hanzo/gui'
import type { Post } from '../lib/types'
import { BORDER, TEXT, MUTED, FAINT, MONO } from '../lib/theme'
import { Avatar } from '../components/author'
import { PostList } from '../components/post-list'

/** Everything one member has published. */
export function AuthorPage({
  author,
  posts,
  colorFor,
  onBack,
  onOpen,
  onAuthor,
}: {
  author: string
  posts: Post[]
  colorFor: (topic: string) => string
  onBack: () => void
  onOpen: (id: string) => void
  onAuthor: (name: string) => void
}) {
  const mine = posts.filter((p) => p.author_name === author)
  const topics = Array.from(new Set(mine.map((p) => p.topic).filter(Boolean)))

  return (
    <YStack maxWidth={1040} width="100%" alignSelf="center" paddingHorizontal={24} paddingVertical={28} gap={22}>
      <Button size="$2" chromeless alignSelf="flex-start" onPress={onBack}>← All posts</Button>

      <XStack alignItems="center" gap={16}>
        <Avatar name={author} size={56} />
        <YStack gap={4}>
          <H2 fontSize={26} fontWeight="800" color={TEXT} letterSpacing={-0.4}>{author}</H2>
          <Text fontFamily={MONO} fontSize={12} color={FAINT}>
            {mine.length} {mine.length === 1 ? 'post' : 'posts'}
            {topics.length ? ` · ${topics.slice(0, 4).join(', ')}` : ''}
          </Text>
        </YStack>
      </XStack>

      <Separator borderColor={BORDER} />

      <PostList
        posts={mine}
        colorFor={colorFor}
        onOpen={onOpen}
        onAuthor={onAuthor}
        empty={<Paragraph color={MUTED}>No posts by {author} yet.</Paragraph>}
      />
    </YStack>
  )
}
