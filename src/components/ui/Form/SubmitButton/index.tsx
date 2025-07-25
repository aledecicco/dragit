import * as Ariakit from '@ariakit/react'

import type { Action } from '@/context/actions'
import { ActionButton } from '@/lib/ActionButton'
import type { ButtonProps } from '@/ui/Button'
import { propsWithCn } from '@/utils/styles'
import type { AnyObject } from '@/utils/types'

import type { FormAction } from '..'

interface FormSubmitButtonProps<T extends AnyObject>
  extends Partial<ButtonProps> {
  /**
   * The action that the form performs on submit.
   */
  action: FormAction<T>

  /**
   * Whether the button should be displayed in a compact form, without its label.
   */
  compact?: boolean
}

/**
 * {@link ActionButton} that submits the form it's contained in, and tracks the form submission as an {@link Action}.
 */
const FormSubmitButton = <T extends AnyObject>(
  props: FormSubmitButtonProps<T>,
) => {
  const { action, compact = false, status = 'primary', ...buttonProps } = props

  return (
    <Ariakit.FormSubmit
      render={
        <ActionButton
          status={status}
          trackOnly
          mainAction={action}
          compact={compact}
          {...propsWithCn(buttonProps, compact ? 'w-max' : 'w-full')}
        />
      }
    />
  )
}

export { FormSubmitButton, type FormSubmitButtonProps }
