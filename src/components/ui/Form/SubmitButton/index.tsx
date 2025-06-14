import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { Action } from '@/lib/ActionButton'
import type { ActionTracker } from '@/lib/ActionButton/utils'
import { Button, type ButtonProps, type ButtonStatus } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'

interface FormSubmitButtonProps extends Partial<ButtonProps> {
  /**
   * Details about the form action that this button submits.
   */
  actionTracker: ActionTracker

  /**
   * Whether the button should be displayed in a compact form, without its label.
   */
  compact?: boolean
}

/**
 * {@link Button} that submits the form it's contained in, and tracks the form submission as an {@link Action}.
 */
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
