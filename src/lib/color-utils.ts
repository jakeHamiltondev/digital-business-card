// WCAG 2.1 contrast utilities and card color token generation.
// All hex inputs accept #rgb or #rrggbb format.

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ]
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function linearize(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1)
  const l2 = luminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break
    case gg: h = ((bb - rr) / d + 2) / 6; break
    case bb: h = ((rr - gg) / d + 4) / 6; break
  }
  return [h * 360, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  const hh = h / 360
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hue2rgb = (t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const r = Math.round(hue2rgb(hh + 1 / 3) * 255)
  const g = Math.round(hue2rgb(hh) * 255)
  const b = Math.round(hue2rgb(hh - 1 / 3) * 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function adjustForContrast(fgHex: string, bgHex: string, minRatio: number): string {
  if (contrastRatio(fgHex, bgHex) >= minRatio) return fgHex
  const [r, g, b] = parseHex(fgHex)
  const [h, s, l] = rgbToHsl(r, g, b)
  const bgL = luminance(bgHex)
  // Move fg toward white on dark bg, toward black on light bg
  const step = bgL < 0.5 ? 0.05 : -0.05
  let current = l
  for (let i = 0; i < 20; i++) {
    current = Math.max(0, Math.min(1, current + step))
    const candidate = hslToHex(h, s, current)
    if (contrastRatio(candidate, bgHex) >= minRatio) return candidate
  }
  return bgL < 0.5 ? '#ffffff' : '#0f172a'
}

// Returns '#ffffff' or '#0f172a' — whichever has better contrast on bgHex.
export function getContrastColor(bgHex: string): string {
  return luminance(bgHex) > 0.179 ? '#0f172a' : '#ffffff'
}

// Adjusts fgHex until it meets WCAG AA (4.5:1) against bgHex.
// Only accepts hex strings — pass resolved hex, not rgba/hsl.
export function ensureContrast(fgHex: string, bgHex: string): string {
  return adjustForContrast(fgHex, bgHex, 4.5)
}

export type CardColorTokens = {
  /** Solid primary background */
  bg: string
  /** CSS gradient string for use as background-image */
  bgGradient: string
  /** Primary text — always ≥ 4.5:1 against bg */
  text: string
  /** Secondary/muted text — ≥ 3:1 against bg (AA Large) */
  textMuted: string
  /** Icon fill color — accent if it passes 3:1, else text */
  iconColor: string
  /** Solid button background (accent color) */
  buttonBg: string
  /** Button label — always ≥ 4.5:1 against buttonBg */
  buttonText: string
  /** Subtle border/divider */
  border: string
  /** QR code container background (always white) */
  qrBg: string
}

// Linkfol brand defaults used when the user has no brand colors (free tier)
const LINKFOL_PRIMARY = '#6366f1'
const LINKFOL_ACCENT  = '#8b5cf6'

export function generateCardColors(
  primary: string | null | undefined,
  accent: string | null | undefined,
): CardColorTokens {
  const p = primary ?? LINKFOL_PRIMARY
  const a = accent  ?? LINKFOL_ACCENT

  const isDark = luminance(p) < 0.179
  const text = isDark ? '#ffffff' : '#0f172a'
  const textMuted = adjustForContrast(
    isDark ? '#d1d5db' : '#64748b',
    p,
    3.0,
  )
  // Use accent as icon color only if it reads clearly on the primary bg
  const iconColor = contrastRatio(a, p) >= 3.0
    ? a
    : adjustForContrast(a, p, 3.0)

  return {
    bg: p,
    bgGradient: `linear-gradient(135deg, ${p} 0%, ${a} 100%)`,
    text,
    textMuted,
    iconColor,
    buttonBg: a,
    buttonText: ensureContrast(getContrastColor(a), a),
    border: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
    qrBg: '#ffffff',
  }
}
