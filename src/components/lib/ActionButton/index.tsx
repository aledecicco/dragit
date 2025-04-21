import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconLoader2,
} from '@tabler/icons-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { match } from 'ts-pattern'

import { Button, type ButtonProps } from '@ui/Button'
import { type Glyph, Icon } from '@ui/Icon'
import { SplitButton } from '@ui/SplitButton'
import { cn } from '@utils/styles'

interface ActionButtonProps extends ButtonProps {
  action: Action
  alternatives?: Action[]
  compact?: boolean
  menuButtonProps?: Partial<ButtonProps>
}

interface Action {
  run: () => Promise<unknown>
  Glyph: Glyph
  label: { [T in ActionState]: string }
}

type ActionState = 'idle' | 'running' | 'success' | 'error'

const ActionButton = (props: ActionButtonProps) => {
  const { action, alternatives, compact, menuButtonProps, ...buttonProps } =
    props

  const [activeAction, setActiveAction] = useState<Action>(action)
  const [state, setState] = useState<ActionState>('idle')
  const timeoutId = useRef<number>(null)

  const Glyph = useMemo(() => {
    return match(state)
      .with('idle', () => activeAction.Glyph)
      .with('running', () => IconLoader2)
      .with('success', () => IconCircleCheckFilled)
      .with('error', () => IconAlertTriangleFilled)
      .exhaustive()
  }, [state, activeAction.Glyph])

  const label = useMemo(() => {
    return match(state)
      .with('idle', () => activeAction.label.idle)
      .with('running', () => activeAction.label.running)
      .with('success', () => activeAction.label.success)
      .with('error', () => activeAction.label.error)
      .exhaustive()
  }, [state, activeAction.label])

  const status = useMemo(() => {
    return match(state)
      .returnType<ButtonProps['status']>()
      .with('idle', () => buttonProps.status)
      .with('running', () => buttonProps.status)
      .with('success', () => 'success')
      .with('error', () => 'error')
      .exhaustive()
  }, [state, buttonProps.status])

  const runAction = useCallback(
    (a: Action) => {
      if (state !== 'running') {
        if (timeoutId.current !== null) {
          clearTimeout(timeoutId.current)
        }

        setState('running')
        a.run()
          .then(() => setState('success'))
          .catch(() => setState('error'))
          .finally(() => {
            timeoutId.current = setTimeout(() => {
              setState('idle')
              setActiveAction(action)
            }, 2000)
          })
      }
    },
    [action, state],
  )

  const menuItems = useMemo(() => {
    return (
      alternatives?.map((alternative) => ({
        label: alternative.label?.idle,
        onClick: () => {
          setActiveAction(alternative)
          runAction(alternative)
        },
        disabled: state === 'running',
      })) ?? []
    )
  }, [alternatives, runAction, state])

  return alternatives?.length ? (
    <SplitButton
      {...buttonProps}
      items={menuItems}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        runAction(action)
      }}
      description={compact ? label : undefined}
      status={status}
      menuButtonProps={menuButtonProps}
    >
      <Icon
        size={buttonProps.size}
        Glyph={Glyph}
        className={cn(state === 'running' && 'animate-spin')}
      />
      {!compact && label}
    </SplitButton>
  ) : (
    <Button
      {...buttonProps}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        runAction(action)
      }}
      description={compact ? label : undefined}
      status={status}
    >
      <Icon
        size={buttonProps.size}
        Glyph={Glyph}
        className={cn(state === 'running' && 'animate-spin')}
      />
      {!compact && label}
    </Button>
  )
}

export { ActionButton, type ActionButtonProps, type Action }
