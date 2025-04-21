import { useRef } from 'react'
import { match } from 'ts-pattern'

import { Button, type ButtonProps } from '@ui/Button'
import { Menu, type MenuItem } from '@ui/Menu'
import { cn, propsWithCn } from '@utils/styles'

interface SplitButtonProps extends Omit<ButtonProps, 'round'> {
  items: MenuItem[]
  menuButtonProps?: Partial<ButtonProps>
}

const SplitButton = (props: SplitButtonProps) => {
  const {
    items,
    menuButtonProps,
    size = 'md',
    className,
    ...buttonProps
  } = props

  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn('flex flex-row items-stretch rounded-md', className)}
      ref={anchorRef}
    >
      <Button
        size={size}
        {...buttonProps}
        className={cn(
          'rounded-l-[inherit] rounded-r-none grow',
          'border-r-1 border-solid border-r-dark-400',
          match(size)
            .with('sm', () => 'pr-1')
            .with('md', () => 'pr-1.5')
            .with('lg', () => 'pr-2')
            .exhaustive(),
        )}
      />

      <Menu
        items={items}
        size={size}
        anchor={
          <Button
            disabled={buttonProps.disabled}
            variant={buttonProps.variant}
            status={buttonProps.status}
            size={size}
            round={false}
            description="View alternatives"
            {...propsWithCn(
              menuButtonProps,
              'h-full',
              'rounded-l-none rounded-r-[inherit]',
              match(size)
                .with('sm', () => 'px-0.5')
                .with('md', () => 'px-0.75')
                .with('lg', () => 'px-1')
                .exhaustive(),
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
            width: rect.width * 2,
            height: rect.height,
          }
        }}
      />
    </div>
  )
}

export { SplitButton, type SplitButtonProps }
