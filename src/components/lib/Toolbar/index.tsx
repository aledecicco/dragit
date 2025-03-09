import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { HTMLAttributes, MouseEventHandler } from 'react'

import type { Glyph } from '@lib/Icon'
import { IconButton } from '@lib/IconButton'
import type { MenuItem } from '@lib/Menu'
import { SplitButton } from '@lib/SplitButton'
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
  size?: Size
  fixed?: boolean
}

const Toolbar = (props: ToolbarProps) => {
  const { tools, size = 'md', fixed, ...toolbarProps } = props

  return (
    <Ariakit.ToolbarProvider>
      <Ariakit.Toolbar
        {...toolbarProps}
        className={clsx(
          'grid grid-flow-col',
          fixed ? 'auto-cols-fr' : 'auto-cols-max',
          toolbarProps.className,
        )}
      >
        {tools.map(({ Glyph, label, action, alternatives, ...toolProps }) =>
          alternatives?.length ? (
            <SplitButton
              key={label}
              action={action}
              variant="neutral"
              items={alternatives}
              size={size}
              {...toolProps}
              className={clsx(
                fixed && '[&]:w-full',
                'not-first:rounded-l-none',
                'not-last:rounded-r-none not-last:border-r-2 not-last:border-solid not-last:border-r-dark-500',
                toolProps.className,
              )}
              buttonProps={{
                className: clsx(fixed && '[&]:pr-0'),
                render: (
                  <Ariakit.ToolbarItem
                    render={
                      <IconButton
                        onClick={action}
                        Glyph={Glyph}
                        label={label}
                        variant="neutral"
                        round={false}
                        size={size}
                      />
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
              }}
            />
          ) : (
            <Ariakit.ToolbarItem
              key={label}
              render={
                <IconButton
                  onClick={action}
                  Glyph={Glyph}
                  label={label}
                  variant="neutral"
                  round={false}
                  size={size}
                />
              }
              {...toolProps}
              className={clsx(
                fixed && '[&]:w-full',
                'not-first:rounded-l-none',
                'not-last:rounded-r-none not-last:border-r-2 not-last:border-solid not-last:border-r-dark-500',
                toolProps.className,
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
