import * as Ariakit from '@ariakit/react'
import type { ComponentType, ReactNode } from 'react'

import { hideDialog, showDialog } from '@context/dialogs'
import { getUniqueId } from '@context/ids'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { Form } from '@ui/Form'
import { InputField } from '@ui/Form/InputField'
import { FormSubmitButton } from '@ui/Form/SubmitButton'

type AskForValueVariant = 'input' | 'text'

interface AskForValueDialogProps extends DialogProps {
  label: string
  submitValue: (value: string | undefined) => void
  variant?: AskForValueVariant
  Message?: ComponentType | ReactNode
  defaultValue?: string
}

const AskForValueDialog = (props: AskForValueDialogProps) => {
  const {
    label,
    submitValue,
    variant = 'input',
    Message,
    defaultValue,
    ...dialogProps
  } = props

  const form = Ariakit.useFormStore({
    defaultValues: {
      value: defaultValue,
    },
  })

  form.useSubmit((formState) => {
    submitValue(formState.values.value)
    hideDialog(dialogProps.dialogKey)
  })

  return (
    <Dialog
      {...dialogProps}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        submitValue(undefined)
      }}
    >
      <Form options={{ store: form }}>
        {typeof Message === 'function' ? <Message /> : Message}

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
        submitValue={(value) => {
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
