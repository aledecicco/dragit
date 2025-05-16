import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import type { ActionTracker } from '@lib/ActionButton/utils'
import { Button, type ButtonProps, type ButtonStatus } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'

interface FormSubmitButtonProps extends Partial<ButtonProps> {
  actionTracker: ActionTracker
  compact?: boolean
}

const FormSubmitButton = (props: FormSubmitButtonProps) => {
  const {
    actionTracker,
    compact = false,
    status = 'primary',
    ...buttonProps
  } = props

  return (
    <Ariakit.FormSubmit
      render={
        <Button
          description={compact ? actionTracker.label : undefined}
          status={match(actionTracker.actionState)
            .returnType<ButtonStatus>()
            .with('idle', () => status)
            .with('running', () => status)
            .with('success', () => 'success')
            .with('error', () => 'error')
            .exhaustive()}
          variant="filled"
          {...propsWithCn(buttonProps, compact ? 'w-max' : 'w-full')}
        >
          <Icon
            size={buttonProps.size}
            Glyph={actionTracker.Glyph}
            className={cn(
              actionTracker.actionState === 'running' && 'animate-spin',
            )}
          />
          {!compact && actionTracker.label}
        </Button>
      }
    />
  )
}

export { FormSubmitButton, type FormSubmitButtonProps }
