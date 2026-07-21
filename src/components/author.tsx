import { XStack, YStack, Text } from '@hanzo/gui'
import { RAISED, TEXT, MUTED, CYAN, MONO, initials, hueOf } from '../lib/theme'

/** A compact, image-less avatar: initials in the author's deterministic hue. */
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const hue = hueOf(name)
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={999}
      backgroundColor={RAISED}
      borderWidth={1}
      borderColor={hue}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontFamily={MONO} fontSize={size * 0.4} fontWeight="700" color={hue}>
        {initials(name)}
      </Text>
    </YStack>
  )
}

/** Avatar + name. Pressable (→ author page) when `onPress` is supplied. */
export function AuthorChip({
  name,
  onPress,
  size = 28,
}: {
  name: string
  onPress?: () => void
  size?: number
}) {
  return (
    <XStack
      alignItems="center"
      gap="$2"
      cursor={onPress ? 'pointer' : 'default'}
      hoverStyle={onPress ? { opacity: 0.8 } : undefined}
      onPress={onPress}
    >
      <Avatar name={name} size={size} />
      <Text fontSize={13} color={onPress ? TEXT : MUTED} hoverStyle={onPress ? { color: CYAN } : undefined}>
        {name}
      </Text>
    </XStack>
  )
}
