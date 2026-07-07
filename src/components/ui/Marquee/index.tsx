import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

import { useThrottledCallback } from '@/utils/performance'
import { cn, propsWithCn } from '@/utils/styles'
import { MS_IN_SECOND } from '@/utils/time'

const INFINITE_SPACING = 32

interface MarqueeProps extends ComponentProps<'div'> {
  /**
   * The speed at which the content scrolls when hovered, in pixels per second.
   * Defaults to 100.
   */
  speed?: number

  /**
   * Whether the marquee should loop infinitely.
   * Defaults to false.
   */
  infinite?: boolean

  /**
   * Whether the marquee should scroll in reverse direction (show rightmost content, and scroll to the left).
   * Defaults to true.
   */
  reverse?: boolean

  /**
   * Whether to display shadows on the sides of the marquee to signal scrollable content.
   * Defaults to true.
   */
  withShadows?: boolean
}

/**
 * Marquee component that tracks its content and scrolls it horizontally when hovered, if necessary.
 */
const Marquee = (props: MarqueeProps) => {
  const {
    speed = 100,
    infinite = false,
    reverse = true,
    withShadows = true,
    children,
    ...divProps
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Sizes as last reported by the ResizeObserver
  const sizes = useRef({ container: 0, content: 0 })

  // Measurements are written directly to the DOM to go around react's render cycle as much as possible.
  const refresh = useThrottledCallback(
    () => {
      const container = containerRef.current

      if (!container) {
        return
      }

      const { container: containerWidth, content: contentWidth } = sizes.current

      const overflow =
        contentWidth - containerWidth > 1
          ? Math.floor(
              infinite
                ? contentWidth + INFINITE_SPACING
                : contentWidth - containerWidth,
            )
          : 0

      container.toggleAttribute('data-overflowing', overflow > 0)
      container.style.setProperty('--marquee-overflow', `${overflow}px`)
      container.style.setProperty(
        '--marquee-duration',
        `${Math.max(0.5, overflow / speed)}s`,
      )
    },
    {
      trailingCall: true,
      delay: MS_IN_SECOND / 30,
    },
  )

  const [observer] = useState(
    () =>
      new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === containerRef.current) {
            sizes.current.container = entry.contentRect.width
          } else if (entry.target === contentRef.current) {
            sizes.current.content = entry.contentRect.width
          }
        }

        refresh()
      }),
  )

  useEffect(() => {
    if (contentRef.current) {
      observer.observe(contentRef.current)
    }

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [observer])

  const childrenCopy = infinite && (
    <div
      className={cn('absolute top-0', reverse ? 'right-full' : 'left-full')}
      style={
        reverse
          ? { marginRight: `${INFINITE_SPACING}px` }
          : { marginLeft: `${INFINITE_SPACING}px` }
      }
      aria-hidden={true}
    >
      {children}
    </div>
  )

  return (
    <div
      {...propsWithCn(
        divProps,
        'group overflow-x-hidden relative max-w-full flex flex-row',
        reverse && 'justify-end',
      )}
      ref={mergeRefs([containerRef, divProps.ref])}
    >
      <div
        ref={contentRef}
        className={cn(
          'text-nowrap whitespace-nowrap min-w-max',
          'group-data-overflowing:will-change-transform',
          'group-data-overflowing:group-hover:animate-scroll-horizontal',
          'group-data-overflowing:group-focus:animate-scroll-horizontal',
          infinite && 'relative',
        )}
        style={
          {
            animationDuration: 'var(--marquee-duration, 1s)',
            animationFillMode: infinite ? undefined : 'forwards',
            animationIterationCount: infinite ? 'infinite' : 1,
            '--scroll-to': infinite
              ? reverse
                ? `calc(100% + ${INFINITE_SPACING}px)`
                : `calc(-100% - ${INFINITE_SPACING}px)`
              : reverse
                ? 'var(--marquee-overflow, 0px)'
                : 'calc(-1 * var(--marquee-overflow, 0px))',
          } as CSSProperties
        }
      >
        {children}
        {childrenCopy}
      </div>

      {withShadows && (
        <>
          <div
            className={cn(
              'hidden group-data-overflowing:block',
              'absolute top-0 -left-0.5 h-full',
              'w-2 bg-linear-to-r from-dark-950/70 to-transparent rounded-r-xs',
              reverse
                ? [
                    'opacity-100',
                    !infinite &&
                      'group-hover:animate-fade-out group-focus:animate-fade-out',
                  ]
                : 'opacity-0 group-hover:animate-fade-in group-focus:animate-fade-in',
              'group-hover:animate-fade-in group-focus:animate-fade-in',
              'pointer-events-none',
            )}
            style={{
              animationDuration:
                'min(0.5s, calc(var(--marquee-duration, 1s) / 2))',
            }}
          />
          <div
            className={cn(
              'hidden group-data-overflowing:block',
              'absolute top-0 -right-0.5 h-full',
              'opacity-100 w-2 bg-linear-to-l from-dark-950/70 to-transparent rounded-r-xs',
              reverse
                ? 'opacity-0 group-hover:animate-fade-in group-focus:animate-fade-in'
                : [
                    'opacity-100',
                    !infinite &&
                      'group-hover:animate-fade-out group-focus:animate-fade-out',
                  ],
            )}
            style={{
              animationDuration: 'var(--marquee-duration, 1s)',
            }}
          />
        </>
      )}
    </div>
  )
}

export { Marquee, type MarqueeProps }
