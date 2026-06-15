import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { ActionButton, type ActionButtonProps } from '@/lib/ActionButton'
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

type ToolbarItemProps<T = void> =
  | CommonToolbarItemProps
  | ActionToolbarItemProps<T>

type CommonToolbarItemProps = BaseToolbarItemProps & DecoratedButtonProps

type ActionToolbarItemProps<T = void> = BaseToolbarItemProps &
  ActionButtonProps<T>

/**
 * A single item inside a {@link Toolbar}.
 */
const ToolbarItem = <T = void>(props: ToolbarItemProps<T>) => {
  if ('action' in props) {
    return <ActionToolbarItem {...props} />
  }

  const { fixed, ...itemProps } = props

  return (
    <BaseToolbarItem
      fixed={fixed}
      status={itemProps.status}
      render={<DecoratedButton {...itemProps} />}
    />
  )
}

const ActionToolbarItem = <T = void>(props: ActionToolbarItemProps<T>) => {
  const { fixed, ...itemProps } = props

  return (
    <BaseToolbarItem
      fixed={fixed}
      status={itemProps.status}
      render={
        <ActionButton
          menuButtonProps={{ render: <Ariakit.ToolbarItem /> }}
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
        'flex flex-row items-center justify-center h-full',
        fixed && 'w-full',
        'not-first:rounded-l-none',
        'not-last:rounded-r-none',
        'not-last:border-solid not-last:border-r',
        match(status)
          .with('primary', () => 'not-last:border-r-primary-800')
          .with('success', () => 'not-last:border-r-green-800')
          .with('warning', () => 'not-last:border-r-warning-800')
          .with('danger', () => 'not-last:border-r-danger-900')
          .with('neutral', () => 'not-last:border-r-dark-500')
          .exhaustive(),
      )}
    />
  )
}

export { ToolbarItem, type ToolbarItemProps }
