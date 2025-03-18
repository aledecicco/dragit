import type { ComponentType, ReactNode } from 'react'

import { hideDialog, showDialog } from '@context/dialogs'
import { getUniqueId } from '@context/ids'
import { InputField } from '@ui/Form/InputField'
import { FormDialog, type FormDialogProps } from '@ui/FormDialog'
import type { PickPartial } from '@utils/types'

type AskForValueVariant = 'input' | 'text'

interface AskForValueDialogProps
  extends PickPartial<
    FormDialogProps<{ value: string | undefined }>,
    'dialogKey'
  > {
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

  return (
    <FormDialog
      {...dialogProps}
      form={{
        defaultValues: {
          value: defaultValue,
        },
        onFormSubmit: (formState) => {
          submitValue(formState.values.value)
          hideDialog(dialogProps.dialogKey)
        },
      }}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        submitValue(undefined)
      }}
    >
      {typeof Message === 'function' ? <Message /> : Message}

      <InputField required autoFocus name="value" label={label} />
    </FormDialog>
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
