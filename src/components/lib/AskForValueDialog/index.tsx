import * as Ariakit from '@ariakit/react'
import type { ReactNode } from 'react'

import { hideDialog, showDialog } from '@context/dialogs'
import { getUniqueId } from '@context/ids'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { Form } from '@ui/Form'
import { InputField } from '@ui/Form/InputField'
import { FormSubmitButton } from '@ui/Form/SubmitButton'

type AskForValueVariant = 'input' | 'text'

interface AskForValueDialogProps extends DialogProps {
  label: string
  action: (value: string | undefined) => void
  variant?: AskForValueVariant
  message?: ReactNode
  defaultValue?: string
}

const AskForValueDialog = (props: AskForValueDialogProps) => {
  const {
    label,
    action,
    variant = 'input',
    message,
    defaultValue,
    ...dialogProps
  } = props

  const form = Ariakit.useFormStore({
    defaultValues: {
      value: defaultValue,
    },
  })

  form.useSubmit((formState) => {
    action(formState.values.value)
    hideDialog(dialogProps.dialogKey)
  })

  return (
    <Dialog
      {...dialogProps}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        action(undefined)
      }}
    >
      <Form options={{ store: form }}>
        {message}

        <InputField required autoFocus name={form.names.value} label={label} />

        <FormSubmitButton>Accept</FormSubmitButton>
      </Form>
    </Dialog>
  )
}

const askForValue = (
  dialogProps?: Partial<AskForValueDialogProps>,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const dialogKey = getUniqueId()

    showDialog(
      dialogKey,
      <AskForValueDialog
        label="Value"
        dialogKey={dialogKey}
        action={(value) => {
          if (value === undefined) {
            reject(new Error('Value not provided'))
          } else {
            resolve(value)
          }
        }}
        {...dialogProps}
      />,
    )
  })
}

export { AskForValueDialog, type AskForValueDialogProps, askForValue }
