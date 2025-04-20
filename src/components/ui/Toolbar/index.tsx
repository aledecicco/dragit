import * as Ariakit from '@ariakit/react'
import type { HTMLAttributes, MouseEventHandler } from 'react'

import { Button, type ButtonStatus, type ButtonVariant } from '@ui/Button'
import { type Glyph, Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import type { MenuItem } from '@ui/Menu'
import { SplitButton } from '@ui/SplitButton'
import { cn, propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

interface ToolbarTool extends HTMLAttributes<HTMLElement> {
  Glyph: Glyph
  label: string
  action: MouseEventHandler<HTMLButtonElement>
  alternatives?: MenuItem[]
  disabled?: boolean
}

interface ToolbarProps extends Ariakit.ToolbarProps {
  tools: ToolbarTool[]
  variant?: ButtonVariant
  status?: ButtonStatus
  size?: Size
  fixed?: boolean
  compact?: boolean
}

const Toolbar = (props: ToolbarProps) => {
  const {
    tools,
    variant = 'filled',
    status = 'neutral',
    size = 'md',
    fixed = false,
    compact = true,
    ...toolbarProps
  } = props

  return (
    <Ariakit.ToolbarProvider>
      <Ariakit.Toolbar
        {...propsWithCn(
          toolbarProps,
          'grid grid-flow-col',
          fixed ? 'auto-cols-fr' : 'auto-cols-max',
        )}
      >
        {tools.map(({ Glyph, label, action, alternatives, ...toolProps }) =>
          alternatives?.length ? (
            <SplitButton
              key={label}
              action={action}
              status={status}
              variant={variant}
              items={alternatives}
              size={size}
              {...propsWithCn(
                toolProps,
                fixed && 'w-full',
                'not-first:rounded-l-none',
                'not-last:rounded-r-none not-last:border-r-2 not-last:border-solid not-last:border-r-dark-500',
              )}
              buttonProps={{
                className: cn(fixed && compact && 'pr-0'),
                render: (
                  <Ariakit.ToolbarItem
                    render={
                      compact ? (
                        <IconButton
                          onClick={action}
                          Glyph={Glyph}
                          label={label}
                          round={false}
                          size={size}
                        />
                      ) : (
                        <Button onClick={action} size={size}>
                          <Icon Glyph={Glyph} size={size} /> {label}
                        </Button>
                      )
                    }
                    disabled={toolbarProps.disabled || toolProps.disabled}
                  />
                ),
              }}
              menuButtonProps={{
                render: (
                  <Ariakit.ToolbarItem
                    disabled={toolbarProps.disabled || toolProps.disabled}
                  />
                ),
                'aria-label': `View alternatives to ${label}`,
              }}
            />
          ) : (
            <Ariakit.ToolbarItem
              key={label}
              render={
                compact ? (
                  <IconButton
                    onClick={action}
                    Glyph={Glyph}
                    label={label}
                    variant={variant}
                    status={status}
                    round={false}
                    size={size}
                  />
                ) : (
                  <Button
                    onClick={action}
                    variant={variant}
                    status={status}
                    size={size}
                  >
                    <Icon Glyph={Glyph} size={size} /> {label}
                  </Button>
                )
              }
              {...propsWithCn(
                toolProps,
                fixed && 'w-full',
                'not-first:rounded-l-none',
                'not-last:rounded-r-none not-last:border-r-2 not-last:border-solid not-last:border-r-dark-500',
              )}
              disabled={toolbarProps.disabled || toolProps.disabled}
            />
          ),
        )}
      </Ariakit.Toolbar>
    </Ariakit.ToolbarProvider>
  )
}

export { Toolbar, type ToolbarProps, type ToolbarTool }
