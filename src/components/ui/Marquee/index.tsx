import {
  type CSSProperties,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

import { useThrottle } from '@utils/performance'
import { cn, propsWithCn } from '@utils/styles'

interface MarqueeProps extends ComponentProps<'div'> {
  speed?: number
  infinite?: boolean
}

const Marquee = (props: MarqueeProps) => {
  const { speed = 100, infinite = false, children, ...divProps } = props

  const [overflow, setOverflow] = useState(0)
  const shouldScroll = overflow > 0
  const animationDuration = Math.max(
    0.5,
    overflow / (speed / (infinite ? 4 : 1)),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const refresh = useThrottle(
    () => {
      if (
        contentRef.current &&
        containerRef.current &&
        contentRef.current.scrollWidth > containerRef.current.clientWidth
      ) {
        setOverflow(
          contentRef.current.scrollWidth - containerRef.current.clientWidth,
        )
      } else {
        setOverflow(0)
      }
    },
    1000 / 30,
    false,
  )

  const observer = useRef(new ResizeObserver(refresh))

  useEffect(() => {
    if (containerRef.current) {
      observer.current.observe(containerRef.current)
    }

    return () => {
      observer.current.disconnect()
    }
  }, [])

  return (
    <div
      {...propsWithCn(divProps, 'group/marquee overflow-x-hidden relative')}
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
              '--scroll-to': infinite ? '-100%' : `${-overflow}px`,
            } as CSSProperties)),
        }}
      >
        {infinite && shouldScroll ? (
          <>
            <div className={cn('mr-8')}>{children}</div>
            <div
              className={cn('absolute top-0 left-full mr-8')}
              aria-hidden={true}
            >
              {children}
            </div>
          </>
        ) : (
          children
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
