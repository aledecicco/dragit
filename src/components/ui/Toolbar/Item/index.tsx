import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import type { Action } from '@/context/actions'
import { ActionButton } from '@/lib/ActionButton'
import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import type { ButtonStatus } from '@/ui/Button'
import { propsWithCn } from '@/utils/styles'

import { Toolbar } from '..'

interface BaseToolbarItemProps extends Ariakit.ToolbarItemProps {
  /**
   * If `true`, it's assumed that the toolbar has a fixed width, and the item will grow proportionally to fill the available space.
   * If `false`, the item will take only as much space as it needs.
   */
  fixed?: boolean

  /**
   * The status of the item.
   */
  status?: ButtonStatus
}

type ToolbarItemProps = CommonMenuItemProps | ActionToolbarItemProps

type CommonMenuItemProps = BaseToolbarItemProps & DecoratedButtonProps

type ActionToolbarItemProps = BaseToolbarItemProps &
  Partial<DecoratedButtonProps> & {
    tool: {
      alternatives?: Action[]
    } & (
      | {
          // biome-ignore lint/suspicious/noExplicitAny: Toolbars need to accept actions with different parameter types.
          mainAction: Action<any>
          trackOnly: true
          onClick: () => void
        }
      | { mainAction: Action<void>; trackOnly?: false }
    )
  }

/**
 * A single item inside a {@link Toolbar}.
 */
const ToolbarItem = (props: ToolbarItemProps) => {
  if ('tool' in props) {
    return <ActionToolbarItem {...props} />
  }

  return (
    <BaseToolbarItem
      fixed={props.fixed}
      status={props.status}
      render={<DecoratedButton {...props} />}
    />
  )
}

const ActionToolbarItem = (props: ActionToolbarItemProps) => {
  const { fixed, tool, ...itemProps } = props
  return (
    <BaseToolbarItem
      fixed={fixed}
      status={itemProps.status}
      render={
        <ActionButton
          menuButtonProps={{ render: <Ariakit.ToolbarItem /> }}
          {...tool}
          {...itemProps}
        />
      }
    />
  )
}
const BaseToolbarItem = (props: BaseToolbarItemProps) => {
  const { fixed = false, status = 'neutral', ...itemProps } = props

  return (
    <Ariakit.ToolbarItem
      {...propsWithCn(
        itemProps,
        'flex flex-row items-center justify-center',
        fixed && 'w-full',
        'not-first:rounded-l-none',
        'not-last:rounded-r-none',
        'not-last:border-solid not-last:border-r',
        match(status)
          .with('primary', () => 'not-last:border-r-primary-800')
          .with('cta', () => 'not-last:border-r-accent-700')
          .with('success', () => 'not-last:border-r-green-800')
          .with('error', () => 'not-last:border-r-danger-900')
          .with('neutral', () => 'not-last:border-r-dark-500')
          .exhaustive(),
      )}
    />
  )
}

export { ToolbarItem, type ToolbarItemProps }
