import type * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import { type ComponentProps, type MouseEventHandler, useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'
import { match } from 'ts-pattern'

import { Button, type ButtonOwnProps } from '@lib/Button'
import { Menu, type MenuItem } from '@lib/Menu'

interface SplitButtonProps
  extends ComponentProps<'div'>,
    Omit<ButtonOwnProps, 'round'> {
  action: MouseEventHandler<HTMLButtonElement>
  items: MenuItem[]
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

  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <div
      {...divProps}
      ref={mergeRefs([anchorRef, divProps.ref])}
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
          match(size)
            .with('sm', () => 'pr-1')
            .with('md', () => 'pr-1.5')
            .with('lg', () => 'pr-2')
            .exhaustive(),
          buttonProps?.className,
        )}
      />

      <Menu
        items={items}
        size={size}
        anchor={
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
        getAnchorRect={() => {
          const rect = anchorRef.current?.getBoundingClientRect()

          if (!rect) {
            return null
          }

          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          }
        }}
      />
    </div>
  )
}

export { SplitButton, type SplitButtonProps }
