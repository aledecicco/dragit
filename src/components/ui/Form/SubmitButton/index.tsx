import * as Ariakit from '@ariakit/react'
import { IconCheck } from '@tabler/icons-react'

import {
  type Action,
  ActionButton,
  type ActionButtonProps,
} from '@lib/ActionButton'
import { propsWithCn } from '@utils/styles'

interface FormSubmitButtonProps extends Partial<ActionButtonProps> {
  action?: Partial<Action>
}

const FormSubmitButton = (props: FormSubmitButtonProps) => {
  const { action, ...buttonProps } = props

  const store = Ariakit.useFormContext()

  return (
    <ActionButton
      status="primary"
      type="submit"
      variant="filled"
      mainAction={{
        run: async () => {
          const res = await store?.submit()

          if (!res) {
            throw new Error('Form submission failed')
          }

          return true
        },
        Glyph: IconCheck,
        label: {
          idle: 'Submit',
          running: 'Submitting',
          success: 'Submitted',
          error: 'Failed',
        },
        ...action,
      }}
      {...propsWithCn(buttonProps, buttonProps.compact ? 'w-max' : 'w-full')}
    />
  )
}

export { FormSubmitButton, type FormSubmitButtonProps }
