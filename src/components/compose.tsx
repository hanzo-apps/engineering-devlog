import { useState, type ReactNode } from 'react'
import { YStack, XStack, Text, Input, Button, Paragraph } from '@hanzo/gui'
import { useMutation, type BaseRecord } from '@hanzo/base/react'
import type { Topic } from '../lib/types'
import {
  SURFACE, RAISED, CODE_BG, BORDER, TEXT, MUTED, FAINT, CYAN, CYAN_BG, MONO,
  hueOf, TOPIC_SUGGESTIONS,
} from '../lib/theme'
import { TopicTag } from './tag'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <YStack gap={7}>
      <Text fontFamily={MONO} fontSize={11} letterSpacing={0.5} color={FAINT}>
        {label.toUpperCase()}
      </Text>
      {children}
    </YStack>
  )
}

/**
 * Compose a post. Writes all three collections: a `posts` row, `topics` rows for
 * any new topic, and `post_topics` join rows for every selected topic. Topic
 * selection is by record id; the first selected topic becomes the post's primary
 * `topic`. A create mutation resolves to the new record, so we chain the joins.
 */
export function Compose({
  authorName,
  topics,
  onCreated,
  onClose,
  refetchTopics,
}: {
  authorName: string
  topics: Topic[]
  onCreated: (postId: string) => void
  onClose: () => void
  refetchTopics: () => Promise<void>
}) {
  const createPost = useMutation('posts', 'create')
  const createTopic = useMutation('topics', 'create')
  const createJoin = useMutation('post_topics', 'create')

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [featured, setFeatured] = useState(false)

  const busy = createPost.isLoading || createJoin.isLoading || createTopic.isLoading
  const ready = title.trim().length > 0 && body.trim().length > 0 && selected.length > 0

  const input = {
    backgroundColor: CODE_BG,
    borderColor: BORDER,
    color: TEXT,
  } as const

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function addTopic(name: string) {
    const clean = name.trim()
    if (!clean || busy) return
    const existing = topics.find((t) => t.name.toLowerCase() === clean.toLowerCase())
    if (existing) {
      if (!selected.includes(existing.id)) toggle(existing.id)
      setNewTopic('')
      return
    }
    const rec = (await createTopic.mutate({ name: clean, color: hueOf(clean) })) as BaseRecord
    await refetchTopics()
    setSelected((s) => [...s, rec.id])
    setNewTopic('')
  }

  async function publish() {
    if (!ready || busy) return
    const primary = topics.find((t) => t.id === selected[0])?.name ?? ''
    const post = (await createPost.mutate({
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      body: body.trim(),
      author_name: authorName,
      topic: primary,
      published_at: new Date().toISOString(),
      featured,
    })) as BaseRecord
    for (const id of selected) await createJoin.mutate({ post_id: post.id, topic_id: id })
    onCreated(post.id)
  }

  const suggestions = TOPIC_SUGGESTIONS.filter(
    (s) => !topics.some((t) => t.name.toLowerCase() === s.toLowerCase()),
  )
  const error = createPost.error || createTopic.error || createJoin.error

  return (
    <YStack backgroundColor={SURFACE} borderWidth={1} borderColor={BORDER} borderRadius={14} padding={20} gap={16}>
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={16} fontWeight="700" color={TEXT}>New post</Text>
        <Button size="$2" chromeless onPress={onClose}>Cancel</Button>
      </XStack>

      <Field label="Title">
        <Input {...input} value={title} onChangeText={setTitle} placeholder="What did you build?" fontSize={16} />
      </Field>

      <Field label="Excerpt">
        <Input {...input} value={excerpt} onChangeText={setExcerpt} placeholder="One line the grid will show." />
      </Field>

      <Field label="Body — prose, fence code with ```">
        <Input
          {...input}
          value={body}
          onChangeText={setBody}
          placeholder={'How it works…\n\n```ts\nexport const answer = 42\n```'}
          multiline
          numberOfLines={8}
          minHeight={180}
        />
      </Field>

      <Field label="Topics — first is primary">
        <XStack flexWrap="wrap" gap={8}>
          {topics.map((t) => (
            <TopicTag
              key={t.id}
              label={t.name}
              color={t.color || CYAN}
              active={selected.includes(t.id)}
              onPress={() => toggle(t.id)}
            />
          ))}
        </XStack>
        {suggestions.length > 0 ? (
          <XStack flexWrap="wrap" gap={8} alignItems="center">
            <Text fontFamily={MONO} fontSize={11} color={FAINT}>add:</Text>
            {suggestions.map((s) => (
              <Text
                key={s}
                fontFamily={MONO}
                fontSize={11}
                color={MUTED}
                cursor="pointer"
                hoverStyle={{ color: CYAN }}
                onPress={() => addTopic(s)}
              >
                +{s}
              </Text>
            ))}
          </XStack>
        ) : null}
        <XStack gap={8}>
          <Input
            {...input}
            flex={1}
            value={newTopic}
            onChangeText={setNewTopic}
            placeholder="New topic…"
            onSubmitEditing={() => addTopic(newTopic)}
          />
          <Button size="$3" disabled={!newTopic.trim()} onPress={() => addTopic(newTopic)}>Add</Button>
        </XStack>
      </Field>

      <XStack
        alignSelf="flex-start"
        alignItems="center"
        gap={8}
        paddingHorizontal={12}
        paddingVertical={7}
        borderRadius={999}
        borderWidth={1}
        cursor="pointer"
        backgroundColor={featured ? CYAN_BG : RAISED}
        borderColor={featured ? CYAN : BORDER}
        onPress={() => setFeatured((f) => !f)}
      >
        <YStack width={8} height={8} borderRadius={999} backgroundColor={featured ? CYAN : FAINT} />
        <Text fontFamily={MONO} fontSize={12} color={featured ? CYAN : MUTED}>Feature this post</Text>
      </XStack>

      {error ? <Paragraph color="#ff7b72" fontSize={13}>{error.message}</Paragraph> : null}

      <XStack>
        <Button theme="active" disabled={!ready || busy} onPress={publish}>
          {busy ? 'Publishing…' : 'Publish post'}
        </Button>
      </XStack>
    </YStack>
  )
}
