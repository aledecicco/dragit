import {
  type CSSProperties,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

import { useThrottledCallback } from '@utils/performance'
import { cn, propsWithCn } from '@utils/styles'
import { MS_IN_SECOND } from '@utils/time'

const INFINITE_SPACING = 32

interface MarqueeProps extends ComponentProps<'div'> {
  speed?: number
  infinite?: boolean
}

const Marquee = (props: MarqueeProps) => {
  const { speed = 100, children, infinite = false, ...divProps } = props

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
    [infinite],
    {
      waitForFrame: false,
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

  return (
    <div
      {...propsWithCn(
        divProps,
        'group/marquee overflow-x-hidden relative max-w-full',
      )}
      ref={mergeRefs([containerRef, divProps.ref])}
    >
      <div
        ref={contentRef}
        className={cn(
          'text-nowrap whitespace-nowrap min-w-max',
          shouldScroll && 'group-hover/marquee:animate-scroll-horizontal',
          infinite && 'relative',
        )}
        style={{
          ...(shouldScroll &&
            ({
              animationDuration: `${animationDuration}s`,
              animationFillMode: infinite ? undefined : 'forwards',
              animationIterationCount: infinite ? 'infinite' : 1,
              '--scroll-to': infinite
                ? `calc(-100% - ${INFINITE_SPACING}px)`
                : `${-overflow}px`,
            } as CSSProperties)),
        }}
      >
        {children}
        {infinite && shouldScroll && (
          <div
            className={cn('absolute top-0 left-full')}
            style={{ marginLeft: `${INFINITE_SPACING}px` }}
            aria-hidden={true}
          >
            {children}
          </div>
        )}
      </div>

      {shouldScroll && (
        <>
          <div
            className={cn(
              'absolute top-0 -left-0.5 h-full',
              'opacity-0 w-1.5 bg-linear-to-r from-dark-950/70 to-dark-950/40 rounded-r-xs',
              'group-hover/marquee:animate-fade-in',
            )}
            style={{
              animationDuration: `${Math.min(0.5, animationDuration / 2)}s`,
            }}
          />
          <div
            className={cn(
              'absolute top-0 -right-0.5 h-full',
              'opacity-100 w-1.5 bg-linear-to-l from-dark-950/70 to-dark-950/40 rounded-r-xs',
              !infinite && 'group-hover/marquee:animate-fade-out',
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
