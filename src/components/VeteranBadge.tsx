interface VeteranBadgeProps {
  size?: 'sm' | 'md'
}

export default function VeteranBadge({ size = 'sm' }: VeteranBadgeProps) {
  const iconSize = size === 'sm' ? 18 : 24
  const textClass = size === 'sm' ? 'text-[8px]' : 'text-[10px]'
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5'
  const gap = size === 'sm' ? 'gap-1.5' : 'gap-2'

  return (
    <div
      className={`inline-flex items-center ${gap} rounded-full border border-zinc-200 bg-white ${padding} shadow-sm dark:border-zinc-700 dark:bg-zinc-900`}
      aria-label="Veteran Owned Business"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
      >
        {/* Shield */}
        <path
          d="M12 2L4 5.5V12c0 5.5 3.6 10.2 8 11.8 4.4-1.6 8-6.3 8-11.8V5.5L12 2z"
          fill="#1B2A4A"
        />
        {/* 5-point star centered at 12,11 */}
        <polygon
          points="12,6.5 13.12,9.46 16.28,9.61 13.81,11.59 14.65,14.64 12,12.9 9.35,14.64 10.19,11.59 7.72,9.61 10.88,9.46"
          fill="white"
        />
      </svg>

      <div className="flex flex-col leading-none">
        <span className={`${textClass} font-bold uppercase tracking-widest text-[#1B2A4A] dark:text-zinc-100`}>
          Veteran Owned
        </span>
        <span className={`${textClass} font-bold uppercase tracking-widest text-red-600`}>
          Business
        </span>
      </div>
    </div>
  )
}
