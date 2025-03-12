import * as Ariakit from '@ariakit/react'
import type { ReactNode } from 'react'

import { propsWithCn } from '@utils/styles'

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
        unmountOnHide
        gutter={8}
        {...propsWithCn(
          tooltipProps,
          'shadow-md bg-dark-400',
          'p-2 rounded-sm text-xs text-light-300',
        )}
      >
        {description}
        <Ariakit.TooltipArrow className="[&>svg]:fill-dark-400" size={12} />
      </Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  )
}

export { Tooltip, type TooltipProps }
