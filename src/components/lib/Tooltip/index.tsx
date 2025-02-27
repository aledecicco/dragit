import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface TooltipProps extends Ariakit.TooltipProps {
  anchor: NonNullable<Ariakit.TooltipAnchorProps['render']>
  description: ReactNode
  placement?: Ariakit.TooltipProviderProps['placement']
}

const Tooltip = (props: TooltipProps) => {
  const { anchor, description, placement, ...tooltipProps } = props

  return (
    <Ariakit.TooltipProvider placement={placement}>
      <Ariakit.TooltipAnchor render={anchor} />
      <Ariakit.Tooltip
        {...tooltipProps}
        gutter={8}
        className={clsx(
          'shadow-md bg-dark-900',
          'p-2 rounded-sm text-xs text-light-300',
          tooltipProps.className,
        )}
      >
        {description}
        <Ariakit.TooltipArrow className="[&>svg]:fill-dark-900" size={12} />
      </Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  )
}

export { Tooltip, type TooltipProps }
