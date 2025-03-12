import clsx from 'clsx'
import {
  type CSSProperties,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

import { useThrottle } from '@utils/performance'

interface MarqueeProps extends ComponentProps<'div'> {
  speed?: number
}

const Marquee = (props: MarqueeProps) => {
  const { speed = 100, children, ...divProps } = props

  const [overflow, setOverflow] = useState(0)
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
      {...divProps}
      ref={mergeRefs([containerRef, divProps.ref])}
      className={clsx('group overflow-x-hidden', divProps.className)}
    >
      <div
        ref={contentRef}
        className={clsx(
          'text-nowrap whitespace-nowrap mr-8',
          overflow > 0 && 'group-hover:animate-scroll-horizontal',
          'min-w-max ',
        )}
        style={{
          ...(overflow > 0 &&
            ({
              animationDuration: `${overflow * (1 / speed)}s`,
              '--scroll-to': `${-overflow}px`,
            } as CSSProperties)),
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { Marquee, type MarqueeProps }
