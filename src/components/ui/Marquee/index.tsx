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
      {...propsWithCn(divProps, 'group/marquee overflow-x-hidden')}
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
              animationDuration: `${overflow * (1 / speed)}s`,
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
    </div>
  )
}

export { Marquee, type MarqueeProps }
