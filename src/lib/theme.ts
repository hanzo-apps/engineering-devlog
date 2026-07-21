/**
 * Devlog's design language, in ONE place — a GitHub-dark developer palette plus
 * the small pure helpers the views share. Colors are raw values (not gui theme
 * tokens) on purpose: the look is a specific near-black canvas with an
 * electric-cyan accent, and @hanzo/gui accepts literal color strings on every
 * color prop. Keeping them here is the single source of truth for the aesthetic.
 */

/** Monospace family for code — a raw CSS stack (@hanzo/gui passes it through). */
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

/** Near-black canvas + surfaces (GitHub-dark mood). */
export const CANVAS = '#0a0d12'
export const SURFACE = '#10151c'
export const RAISED = '#151c25'
export const CODE_BG = '#0b0e14'

/** Hairline border. */
export const BORDER = '#1e2732'

/** Type. */
export const TEXT = '#e6edf3'
export const MUTED = '#9aa4b2'
export const FAINT = '#6b7482'

/** The electric-cyan brand accent + its tints. */
export const CYAN = '#22d3ee'
export const CYAN_BG = 'rgba(34,211,238,0.10)'
export const CYAN_BORDER = 'rgba(34,211,238,0.35)'

/** Syntax-token colors — the featured accent bar and the hero code card. */
export const SYN = {
  keyword: '#ff7b72',
  func: '#d2a8ff',
  string: '#a5d6ff',
  number: '#79c0ff',
  variable: '#ffa657',
  comment: '#8b949e',
  green: '#3fb950',
} as const

/** The five-segment strip painted atop featured posts — reads as a highlighted line. */
export const ACCENT_BAR = [SYN.func, SYN.number, SYN.green, CYAN, SYN.variable]

/** Deterministic per-topic / per-author accent, chosen from a fixed palette. */
export const PALETTE = [CYAN, SYN.string, SYN.green, SYN.func, SYN.variable, SYN.number, SYN.keyword, '#f0b72f']

/** Topics offered as one-tap quick-adds on a fresh org (no auto-writes). */
export const TOPIC_SUGGESTIONS = [
  'Architecture', 'Rust', 'TypeScript', 'Infrastructure', 'AI', 'Performance', 'Databases', 'Security',
]

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** A stable color from PALETTE for a name/topic — same input, same hue. */
export function hueOf(seed: string): string {
  return PALETTE[hash(seed) % PALETTE.length]
}

/** Up-to-two-letter initials for a compact avatar. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** `2026-07-21T…` → `Jul 21, 2026`. Empty/invalid → ''. */
export function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export type BodySegment =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string; lang: string }

/**
 * Split a post body into prose and fenced code blocks (```lang … ```), so the
 * detail view can render prose as paragraphs and code in a monospace block.
 */
export function parseBody(body: string): BodySegment[] {
  const out: BodySegment[] = []
  let buf: string[] = []
  let inCode = false
  let lang = ''
  const flush = () => {
    const text = buf.join('\n')
    if (inCode) out.push({ kind: 'code', text, lang })
    else if (text.trim()) out.push({ kind: 'text', text })
    buf = []
  }
  for (const line of body.split('\n')) {
    const fence = line.match(/^```(\w*)\s*$/)
    if (fence) {
      flush()
      inCode = !inCode
      lang = inCode ? fence[1] || '' : ''
      continue
    }
    buf.push(line)
  }
  flush()
  return out
}
