'use client'

import { ensureContrast } from '@/lib/color-utils'

type Tag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'

export default function ContrastText({
  children,
  color,
  bgColor,
  className,
  style,
  as: Tag = 'span',
}: {
  children: React.ReactNode
  color: string
  bgColor: string
  className?: string
  style?: React.CSSProperties
  as?: Tag
}) {
  return (
    <Tag className={className} style={{ ...style, color: ensureContrast(color, bgColor) }}>
      {children}
    </Tag>
  )
}
