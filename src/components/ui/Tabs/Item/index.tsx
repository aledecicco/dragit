import * as Ariakit from '@ariakit/react'

import { Button, type ButtonProps } from '@/ui/Button'
import { cn, propsWithCn } from '@/utils/styles'

import { Tabs } from '..'

interface TabProps extends ButtonProps {
  /**
   * The tab identifier.
   */
  id: string
}

/**
 * A single tab inside a {@link Tabs} list.
 */
const Tab = (props: TabProps) => {
  const { id, ...buttonProps } = props

  return (
    <Ariakit.Tab
      id={id}
      render={
        <Button
          variant="plain"
          {...propsWithCn(buttonProps, 'relative rounded-xl rounded-b-none')}
        >
          <div
            className={cn('absolute -left-2 bottom-0 bg-inherit w-2 h-2.5')}
            style={{
              clipPath: 'path("M 0 10 C 6 7.5 6 7.5 8 0 L 8 10 Z")',
            }}
          />

          {buttonProps.children}

          <div
            className={cn('absolute -right-2 bottom-0 bg-inherit w-2 h-2.5')}
            style={{
              clipPath: 'path("M 8 10 C 2 7.5 2 7.5 0 0 L 0 10 Z")',
            }}
          />
        </Button>
      }
    />
  )
}

export { Tab, type TabProps }
