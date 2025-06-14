import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

interface TooltipProps extends Ariakit.TooltipProps {
  /**
   * The anchor element that triggers the tooltip when hovered.
   */
  anchor: NonNullable<Ariakit.TooltipAnchorProps['render']>

  /**
   * The content to display inside the tooltip.
   */
  description: ReactNode

  /**
   * The placement of the tooltip relative to the anchor.
   * Defaults to 'top'.
   */
  placement?: Ariakit.TooltipProviderProps['placement']
}

/**
 * Tooltip component with default styles that is triggered when hovering over an anchor.
 */
const Tooltip = (props: TooltipProps) => {
  const { anchor, description, placement = 'top', ...tooltipProps } = props

  return (
    <Ariakit.TooltipProvider placement={placement}>
      <Ariakit.TooltipAnchor render={anchor} />
      <Ariakit.Tooltip
        unmountOnHide
        gutter={8}
        {...propsWithCn(
          tooltipProps,
          'shadow-md bg-dark-400',
          'p-2 rounded-sm text-xs text-light-300',
        )}
      >
        {description}
        <Ariakit.TooltipArrow
          className={cn('[&>svg]:fill-dark-400')}
          size={12}
        />
      </Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  )
}

export { Tooltip, type TooltipProps }
