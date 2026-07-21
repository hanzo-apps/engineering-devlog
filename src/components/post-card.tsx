import { YStack, XStack, Text, Paragraph, Separator } from '@hanzo/gui'
import type { Post } from '../lib/types'
import { SURFACE, BORDER, CYAN, CYAN_BORDER, TEXT, MUTED, FAINT, MONO, ACCENT_BAR, formatDate } from '../lib/theme'
import { TopicTag } from './tag'
import { AuthorChip } from './author'

/** The syntax-highlight strip painted atop featured posts. */
function AccentBar() {
  return (
    <XStack height={3}>
      {ACCENT_BAR.map((c, i) => (
        <YStack key={i} flexGrow={1} backgroundColor={c} />
      ))}
    </XStack>
  )
}

/**
 * A cover-less post card: topic tag + title + excerpt, with an author footer.
 * The body region opens the post; the footer's author chip opens the author
 * page — two sibling press targets, never nested.
 */
export function PostCard({
  post,
  topicColor,
  onOpen,
  onAuthor,
}: {
  post: Post
  topicColor: string
  onOpen: () => void
  onAuthor: () => void
}) {
  return (
    <YStack
      flexBasis={340}
      flexGrow={1}
      minWidth={280}
      maxWidth={560}
      backgroundColor={SURFACE}
      borderWidth={1}
      borderColor={BORDER}
      borderRadius={12}
      overflow="hidden"
      hoverStyle={{ borderColor: CYAN_BORDER }}
    >
      {post.featured ? <AccentBar /> : null}
      <YStack padding={16} gap={10} cursor="pointer" onPress={onOpen}>
        <XStack alignItems="center" justifyContent="space-between" gap="$2">
          <TopicTag label={post.topic || 'general'} color={topicColor} />
          {post.featured ? (
            <Text fontFamily={MONO} fontSize={10} letterSpacing={0.6} color={CYAN}>
              FEATURED
            </Text>
          ) : null}
        </XStack>
        <Text fontSize={17} fontWeight="700" lineHeight={23} color={TEXT} numberOfLines={2}>
          {post.title}
        </Text>
        <Paragraph fontSize={14} lineHeight={21} color={MUTED} numberOfLines={3}>
          {post.excerpt}
        </Paragraph>
      </YStack>
      <Separator borderColor={BORDER} />
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal={16} paddingVertical={11}>
        <AuthorChip name={post.author_name} onPress={onAuthor} size={24} />
        <Text fontFamily={MONO} fontSize={11} color={FAINT}>
          {formatDate(post.published_at)}
        </Text>
      </XStack>
    </YStack>
  )
}
