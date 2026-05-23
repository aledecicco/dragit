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

  const [overflow, setOverflow] = useState(0)
  const shouldScroll = overflow > 0
  const animationDuration = Math.max(0.5, overflow / speed)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const refresh = useThrottledCallback(
    () => {
      if (
        contentRef.current &&
        containerRef.current &&
        contentRef.current.clientWidth > containerRef.current.clientWidth
      ) {
        setOverflow(
          infinite
            ? contentRef.current.clientWidth + INFINITE_SPACING
            : contentRef.current.clientWidth - containerRef.current.clientWidth,
        )
      } else {
        setOverflow(0)
      }
    },
    {
      trailingCall: true,
      delay: MS_IN_SECOND / 30,
    },
  )

  const observer = useRef(new ResizeObserver(refresh))

  useEffect(() => {
    if (contentRef.current) {
      observer.current.observe(contentRef.current)
    }

    if (containerRef.current) {
      observer.current.observe(containerRef.current)
    }

    return () => {
      observer.current.disconnect()
    }
  }, [])

  const childrenCopy = infinite && shouldScroll && (
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
          shouldScroll &&
            'group-hover:animate-scroll-horizontal group-focus:animate-scroll-horizontal',
          infinite && 'relative',
        )}
        style={{
          ...(shouldScroll &&
            ({
              animationDuration: `${animationDuration}s`,
              animationFillMode: infinite ? undefined : 'forwards',
              animationIterationCount: infinite ? 'infinite' : 1,
              '--scroll-to': infinite
                ? reverse
                  ? `calc(100% + ${INFINITE_SPACING}px)`
                  : `calc(-100% - ${INFINITE_SPACING}px)`
                : reverse
                  ? `${overflow}px`
                  : `${-overflow}px`,
            } as CSSProperties)),
        }}
      >
        {reverse ? (
          <>
            {children}
            {childrenCopy}
          </>
        ) : (
          <>
            {children}
            {childrenCopy}
          </>
        )}
      </div>

      {shouldScroll && withShadows && (
        <>
          <div
            className={cn(
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
              animationDuration: `${Math.min(0.5, animationDuration / 2)}s`,
            }}
          />
          <div
            className={cn(
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
              animationDuration: `${animationDuration}s`,
            }}
          />
        </>
      )}
    </div>
  )
}

export { Marquee, type MarqueeProps }
