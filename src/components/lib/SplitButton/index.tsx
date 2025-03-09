import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { ComponentProps, MouseEventHandler } from 'react'
import { match } from 'ts-pattern'

import { Button, type ButtonOwnProps } from '@lib/Button'
import { type Glyph, Icon } from '@lib/Icon'
import { useCombinedRef } from '@utils/hooks'

interface SplitButtonMenuItem extends Ariakit.MenuItemProps {
  Glyph?: Glyph
  label: string
  action: MouseEventHandler<HTMLDivElement>
}

interface SplitButtonProps
  extends ComponentProps<'div'>,
    Omit<ButtonOwnProps, 'round'> {
  action: MouseEventHandler<HTMLButtonElement>
  items: SplitButtonMenuItem[]
  buttonProps?: Partial<Ariakit.ButtonProps>
  menuButtonProps?: Partial<Ariakit.ButtonProps>
}

const SplitButton = (props: SplitButtonProps) => {
  const {
    action,
    items,
    variant,
    size = 'md',
    buttonProps,
    menuButtonProps,
    ...divProps
  } = props

  const ref = useCombinedRef(divProps.ref)

  return (
    <div
      {...divProps}
      ref={ref}
      className={clsx(
        'flex flex-row items-stretch rounded-md',
        divProps.className,
      )}
    >
      <Button
        variant={variant}
        round={false}
        size={size}
        onClick={action}
        {...buttonProps}
        className={clsx(
          'rounded-l-[inherit] rounded-r-none grow',
          'border-r-1 border-solid border-r-dark-400',
          'pr-0',
          buttonProps?.className,
        )}
      />

      <Ariakit.MenuProvider>
        <Ariakit.MenuButton
          render={
            <Button
              variant={variant}
              round={false}
              size={size}
              {...menuButtonProps}
              className={clsx(
                'group rounded-l-none rounded-r-[inherit]',
                match(size)
                  .with('sm', () => '[&]:px-0.5')
                  .with('md', () => '[&]:px-0.75')
                  .with('lg', () => '[&]:px-1')
                  .exhaustive(),
                menuButtonProps?.className,
              )}
            />
          }
        >
          <Ariakit.MenuButtonArrow
            className={clsx('group-aria-expanded:rotate-180')}
          />
        </Ariakit.MenuButton>

        <Ariakit.Menu
          gutter={4}
          portal
          unmountOnHide
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
                  'rounded-sm text-light-100',
                  match(size)
                    .with('sm', () => 'text-xs p-1')
                    .with('md', () => 'text-xs p-2')
                    .with('lg', () => 'p-2.5')
                    .exhaustive(),
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

export { SplitButton, type SplitButtonProps, type SplitButtonMenuItem }
