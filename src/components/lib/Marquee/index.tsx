import clsx from 'clsx'
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

interface MarqueeProps extends ComponentProps<'div'> {
  speed?: number
}

const Marquee = (props: MarqueeProps) => {
  const { speed = 100, children, ...divProps } = props

  const [duration, setDuration] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    if (
      contentRef.current &&
      containerRef.current &&
      contentRef.current.scrollWidth > containerRef.current.clientWidth
    ) {
      setDuration((contentRef.current?.scrollWidth ?? 0) * (1 / speed))
    } else {
      setDuration(0)
    }
  }, [speed])

  const observer = useRef(new ResizeObserver(refresh))

  useEffect(() => {
    if (contentRef.current) {
      observer.current.observe(contentRef.current)
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
        className={clsx(
          'w-full min-w-max group-hover:animate-scroll-horizontal',
          'relative',
        )}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        <div
          ref={contentRef}
          className={clsx('text-nowrap whitespace-nowrap mr-8', 'min-w-max ')}
        >
          {children}
        </div>
        <div
          aria-hidden={true}
          className={clsx(
            'absolute left-full top-0',
            'text-nowrap whitespace-nowrap mr-8',
            'min-w-max',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export { Marquee, type MarqueeProps }
