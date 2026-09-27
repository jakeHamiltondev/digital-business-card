'use client'

const sizeMap = {
  sm:  { height: 36,  maxWidth: 140 },
  md:  { height: 48,  maxWidth: 160 },
  lg:  { height: 110, maxWidth: 220 },
}

export default function LogoDisplay({
  url,
  alt = 'Logo',
  size = 'md',
}: {
  url: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const { height, maxWidth } = sizeMap[size]
  return (
    <img
      src={url}
      alt={alt}
      style={{ height, maxWidth, width: 'auto', objectFit: 'contain' }}
    />
  )
}
