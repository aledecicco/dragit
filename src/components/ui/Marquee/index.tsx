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

interface MarqueeProps extends ComponentProps<'div'> {
  speed?: number
}

const Marquee = (props: MarqueeProps) => {
  const { speed = 100, children, ...divProps } = props

  const [overflow, setOverflow] = useState(0)
  const shouldScroll = overflow > 0
  const animationDuration = Math.max(0.5, overflow / speed)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const refresh = useThrottledCallback({
    waitForFrame: false,
    trailingCall: true,
    delay: 1000 / 30,
    callback: () => {
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
  })

  const observer = useRef(new ResizeObserver(() => refresh()))

  useEffect(() => {
    if (containerRef.current) {
      observer.current.observe(containerRef.current)
    }

    if (contentRef.current) {
      observer.current.observe(contentRef.current)
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
        )}
        style={{
          ...(shouldScroll &&
            ({
              animationDuration: `${animationDuration}s`,
              '--scroll-to': `${-overflow}px`,
            } as CSSProperties)),
        }}
      >
        {children}
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
              'group-hover/marquee:animate-fade-out',
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
