import { YStack, XStack, Text, Paragraph } from '@hanzo/gui'
import { CODE_BG, BORDER, TEXT, MUTED, CYAN, MONO, SYN, parseBody } from '../lib/theme'

/** A fenced code block: a labelled, monospace, near-black panel. */
function Code({ text, lang }: { text: string; lang: string }) {
  return (
    <YStack backgroundColor={CODE_BG} borderWidth={1} borderColor={BORDER} borderRadius={10} overflow="hidden">
      <XStack
        alignItems="center"
        gap={7}
        paddingHorizontal={14}
        paddingVertical={8}
        borderBottomWidth={1}
        borderColor={BORDER}
      >
        <YStack width={9} height={9} borderRadius={999} backgroundColor={SYN.keyword} />
        <YStack width={9} height={9} borderRadius={999} backgroundColor={SYN.variable} />
        <YStack width={9} height={9} borderRadius={999} backgroundColor={SYN.green} />
        {lang ? (
          <Text fontFamily={MONO} fontSize={11} color={CYAN} marginLeft={6} letterSpacing={0.4}>
            {lang}
          </Text>
        ) : null}
      </XStack>
      <YStack padding={16}>
        <Text fontFamily={MONO} fontSize={13} lineHeight={21} color={TEXT}>
          {text}
        </Text>
      </YStack>
    </YStack>
  )
}

/**
 * Render a post body: prose becomes paragraphs, ```fenced``` spans become code
 * blocks. Prose keeps intentional blank-line breaks.
 */
export function Body({ body }: { body: string }) {
  const segments = parseBody(body)
  return (
    <YStack gap="$4">
      {segments.map((seg, i) =>
        seg.kind === 'code' ? (
          <Code key={i} text={seg.text} lang={seg.lang} />
        ) : (
          <YStack key={i} gap="$3">
            {seg.text.split(/\n{2,}/).map((para, j) => (
              <Paragraph key={j} fontSize={16} lineHeight={26} color={MUTED}>
                {para.trim()}
              </Paragraph>
            ))}
          </YStack>
        ),
      )}
    </YStack>
  )
}
