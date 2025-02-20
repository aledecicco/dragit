import clsx from 'clsx'
import { type ComponentProps, useEffect, useRef, useState } from 'react'

import { Tooltip } from '@lib/Tooltip'

interface EllipsisTextProps extends ComponentProps<'p'> {
  tooltip?: boolean
}

const EllipsisText = (props: EllipsisTextProps) => {
  const { tooltip = true, ...pProps } = props
  const ref = useRef<HTMLParagraphElement>(null)

  const [needsTooltip, setNeedsTooltip] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to recalculate when text changes
  useEffect(() => {
    if (ref.current) {
      setNeedsTooltip(ref.current.scrollWidth > ref.current.offsetWidth)
    }
  }, [pProps.children])

  return tooltip && needsTooltip ? (
    <Tooltip content={<p {...pProps} />}>
      <p
        ref={ref}
        {...pProps}
        className={clsx('overflow-hidden overflow-ellipsis', pProps.className)}
      />
    </Tooltip>
  ) : (
    <p
      ref={ref}
      {...pProps}
      className={clsx('overflow-hidden overflow-ellipsis', pProps.className)}
    />
  )
}

export { EllipsisText, type EllipsisTextProps }
