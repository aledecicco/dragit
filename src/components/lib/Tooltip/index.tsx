import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface TooltipProps extends TooltipPrimitive.TooltipProps {
  content: ReactNode
  contentProps?: TooltipPrimitive.TooltipContentProps
}

const Tooltip = (props: TooltipProps) => {
  const { content, contentProps, ...tooltipProps } = props

  return (
    <TooltipPrimitive.Root {...tooltipProps}>
      <TooltipPrimitive.Trigger asChild>
        {tooltipProps.children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="left"
          sideOffset={8}
          align="center"
          {...contentProps}
          className={clsx(
            'shadow-md bg-dark-900',
            'p-4 rounded-md',
            contentProps?.className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-dark-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export { Tooltip, type TooltipProps }
