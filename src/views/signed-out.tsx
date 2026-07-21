import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Text, Paragraph, Button } from '@hanzo/gui'
import {
  CANVAS, SURFACE, RAISED, CODE_BG, BORDER, TEXT, MUTED, FAINT,
  CYAN, CYAN_BORDER, MONO, SYN,
} from '../lib/theme'
import { TopicTag } from '../components/tag'

/** A faux source line: line number + syntax-colored tokens. */
type Tok = { t: string; c: string }
const CODE: Tok[][] = [
  [{ t: '// ship it when the suite is green', c: SYN.comment }],
  [
    { t: 'export ', c: SYN.keyword }, { t: 'async function ', c: SYN.keyword },
    { t: 'deploy', c: SYN.func }, { t: '(app', c: TEXT }, { t: ': ', c: MUTED },
    { t: 'App', c: SYN.number }, { t: ') {', c: TEXT },
  ],
  [
    { t: '  const ', c: SYN.keyword }, { t: 'build', c: TEXT }, { t: ' = ', c: MUTED },
    { t: 'await ', c: SYN.keyword }, { t: 'bundle', c: SYN.func }, { t: '(app)', c: TEXT },
  ],
  [
    { t: '  if ', c: SYN.keyword }, { t: '(!build.ok) ', c: TEXT },
    { t: 'throw new ', c: SYN.keyword }, { t: 'Error', c: SYN.func },
    { t: '(', c: TEXT }, { t: "'build failed'", c: SYN.string }, { t: ')', c: TEXT },
  ],
  [{ t: ' ', c: TEXT }],
  [
    { t: '  await ', c: SYN.keyword }, { t: 'push', c: SYN.func },
    { t: '(build, { edge: ', c: TEXT }, { t: "'hanzo.app'", c: SYN.string }, { t: ' })', c: TEXT },
  ],
  [
    { t: '  return ', c: SYN.keyword }, { t: '{ url: ', c: TEXT },
    { t: '`…/${app.slug}`', c: SYN.string }, { t: ' }', c: TEXT },
  ],
  [{ t: '}', c: TEXT }],
]

function BrandMark() {
  return (
    <YStack
      width={34} height={34} borderRadius={9}
      backgroundColor={RAISED} borderWidth={1} borderColor={CYAN_BORDER}
      alignItems="center" justifyContent="center"
    >
      <Text fontFamily={MONO} fontSize={14} fontWeight="800" color={CYAN}>{'</>'}</Text>
    </YStack>
  )
}

function CodeCard() {
  return (
    <YStack
      flexBasis={420} flexGrow={1} minWidth={300}
      backgroundColor={CODE_BG} borderWidth={1} borderColor={BORDER} borderRadius={14} overflow="hidden"
    >
      <XStack alignItems="center" gap={8} paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderColor={BORDER} backgroundColor={SURFACE}>
        <YStack width={11} height={11} borderRadius={999} backgroundColor={SYN.keyword} />
        <YStack width={11} height={11} borderRadius={999} backgroundColor={SYN.variable} />
        <YStack width={11} height={11} borderRadius={999} backgroundColor={SYN.green} />
        <Text fontFamily={MONO} fontSize={12} color={MUTED} marginLeft={8}>deploy.ts</Text>
        <XStack flexGrow={1} />
        <Text fontFamily={MONO} fontSize={11} color={CYAN}>main</Text>
      </XStack>
      <YStack paddingVertical={16} paddingHorizontal={16} gap={3}>
        {CODE.map((line, i) => (
          <XStack key={i} gap={14}>
            <Text fontFamily={MONO} fontSize={12.5} lineHeight={21} color={FAINT} width={18} textAlign="right">{i + 1}</Text>
            <Text fontFamily={MONO} fontSize={12.5} lineHeight={21}>
              {line.map((tok, j) => (
                <Text key={j} color={tok.c}>{tok.t}</Text>
              ))}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  )
}

/**
 * Signed-out landing — the public, honest thumbnail. No data, no auth-gated
 * content: a dark-mode hero that states what Devlog is and hands every credential
 * interaction to Hanzo IAM (hanzo.id) via one PKCE button.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={CANVAS} alignItems="center">
      <YStack width="100%" maxWidth={1040} paddingHorizontal={24} paddingVertical={56} gap={44}>
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={11}>
            <BrandMark />
            <Text fontSize={19} fontWeight="800" color={TEXT} letterSpacing={-0.3}>devlog</Text>
          </XStack>
          <Text fontFamily={MONO} fontSize={12} color={FAINT}>How we build, in the open.</Text>
        </XStack>

        <XStack flexWrap="wrap" gap={44} alignItems="center">
          <YStack flexBasis={440} flexGrow={1} minWidth={300} gap={22}>
            <XStack alignItems="center" gap={8}>
              <YStack width={7} height={7} borderRadius={999} backgroundColor={CYAN} />
              <Text fontFamily={MONO} fontSize={12} letterSpacing={1} color={CYAN}>THE ENGINEERING BLOG</Text>
            </XStack>
            <H1 fontSize={52} lineHeight={55} fontWeight="800" color={TEXT} letterSpacing={-1}>
              How we build,{'\n'}
              <Text color={CYAN}>in the open.</Text>
            </H1>
            <Paragraph fontSize={17} lineHeight={27} color={MUTED} maxWidth={460}>
              A multi-author log of how the team ships — architecture calls, war
              stories, and the code behind them. Every post is attributed, tagged,
              and written for people who read diffs.
            </Paragraph>
            <XStack flexWrap="wrap" gap={8}>
              <TopicTag label="Architecture" color={CYAN} />
              <TopicTag label="Rust" color={SYN.variable} />
              <TopicTag label="TypeScript" color={SYN.string} />
              <TopicTag label="Infrastructure" color={SYN.green} />
              <TopicTag label="AI" color={SYN.func} />
            </XStack>
            <YStack gap={10} alignItems="flex-start" paddingTop={4}>
              <Button size="$5" theme="active" disabled={isLoading} onPress={() => login()}>
                {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
              </Button>
              <Text fontFamily={MONO} fontSize={12} color={FAINT}>Sign in to read the log and publish your own.</Text>
            </YStack>
          </YStack>

          <CodeCard />
        </XStack>

        <XStack borderTopWidth={1} borderColor={BORDER} paddingTop={20} justifyContent="space-between" flexWrap="wrap" gap={12}>
          <Text fontFamily={MONO} fontSize={11.5} color={FAINT}>Built on Hanzo · @hanzo/gui · IAM · Base</Text>
          <Text fontFamily={MONO} fontSize={11.5} color={FAINT}>PKCE → hanzo.id · org-scoped data</Text>
        </XStack>
      </YStack>
    </YStack>
  )
}
