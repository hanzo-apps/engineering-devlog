import { XStack, YStack, Text } from '@hanzo/gui'
import { RAISED, BORDER, MUTED, CYAN, CYAN_BG, MONO } from '../lib/theme'

/**
 * A topic chip — a colored dot + monospace label. Defaults to the electric-cyan
 * brand accent; pass a topic's `color` to theme it. Pressable when `onPress` is
 * given (used as a grid filter); `active` lifts it to the accent color.
 */
export function TopicTag({
  label,
  color = CYAN,
  onPress,
  active = false,
}: {
  label: string
  color?: string
  onPress?: () => void
  active?: boolean
}) {
  return (
    <XStack
      alignItems="center"
      gap={6}
      paddingHorizontal={9}
      paddingVertical={4}
      borderRadius={999}
      backgroundColor={active ? CYAN_BG : RAISED}
      borderWidth={1}
      borderColor={active ? color : BORDER}
      cursor={onPress ? 'pointer' : 'default'}
      hoverStyle={onPress ? { borderColor: color } : undefined}
      onPress={onPress}
    >
      <YStack width={6} height={6} borderRadius={999} backgroundColor={color} />
      <Text fontFamily={MONO} fontSize={11} letterSpacing={0.3} color={active ? color : MUTED}>
        {label}
      </Text>
    </XStack>
  )
}
