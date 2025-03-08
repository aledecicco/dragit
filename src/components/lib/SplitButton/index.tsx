import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { MouseEventHandler } from 'react'

import { Button, type ButtonProps } from '@lib/Button'
import { type Glyph, Icon } from '@lib/Icon'
import { IconButton, type IconButtonProps } from '@lib/IconButton'
import { match } from 'ts-pattern'

interface SplitButtonItem extends Ariakit.MenuItemProps {
  Glyph?: Glyph
  label: string
  action: MouseEventHandler<HTMLDivElement>
}

interface SplitButtonProps extends IconButtonProps {
  items: SplitButtonItem[]
  menuButtonProps?: Partial<ButtonProps>
}

const SplitButton = (props: SplitButtonProps) => {
  const {
    items,
    menuButtonProps,
    Glyph,
    label,
    variant,
    round,
    size = 'sm',
    ...buttonProps
  } = props

  return (
    <div className={clsx('flex flex-row group items-stretch')}>
      <IconButton
        Glyph={Glyph}
        label={label}
        variant={variant}
        round={round}
        size={size}
        {...buttonProps}
        className={clsx('rounded-r-none grow', buttonProps.className)}
      />

      <Ariakit.MenuProvider>
        <Ariakit.MenuButton
          render={
            <Button
              variant={variant}
              round={round}
              size={size}
              {...menuButtonProps}
              className={clsx(
                'group rounded-l-none [&]:h-[unset]',
                'border-l-1 border-solid border-l-dark-100',
                match(size)
                  .with('sm', () => '[&]:px-1')
                  .with('md', () => '[&]:px-1.75')
                  .with('lg', () => '[&]:px-2.25')
                  .exhaustive(),
                menuButtonProps?.className,
              )}
            >
              <Ariakit.MenuButtonArrow
                className={clsx('group-aria-expanded:rotate-180')}
              />
            </Button>
          }
        />

        <Ariakit.Menu
          gutter={4}
          portal
          className={clsx('rounded-lg shadow-md p-1', 'bg-dark-300')}
        >
          {items.map((menuItem) => {
            const { Glyph, label, action, ...menuItemProps } = menuItem

            return (
              <Ariakit.MenuItem
                key={label}
                aria-label={label}
                onClick={action}
                {...menuItemProps}
                className={clsx(
                  'flex flex-row items-center gap-x-2',
                  'text-xs p-2 rounded-sm',
                  'cursor-pointer hover:bg-dark-200 data-[active-item]:bg-dark-200',
                  menuItemProps.className,
                )}
              >
                {Glyph && <Icon Glyph={Glyph} size="sm" />}
                {label}
              </Ariakit.MenuItem>
            )
          })}
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </div>
  )
}

export { SplitButton, type SplitButtonProps, type SplitButtonItem }
