import type { ComponentType } from 'react'

import { type DialogKey, hideDialog, showDialog } from '@context/dialogs'
import { getUniqueId } from '@context/ids'
import { FormDialog, type FormDialogProps } from '@ui/FormDialog'
import type { AnyObject, PickPartial } from '@utils/types'

interface AskForValueDialogProps<T extends AnyObject>
  extends PickPartial<FormDialogProps<T>, 'dialogKey'> {
  submitValue: (value: T | undefined) => void
  defaultValues: T
}

const AskForValueDialog = <T extends AnyObject>(
  props: AskForValueDialogProps<T>,
) => {
  const { submitValue, defaultValues, ...dialogProps } = props

  return (
    <FormDialog
      {...dialogProps}
      formOptions={{
        defaultValues,
        ...dialogProps.formOptions,
        onFormSubmit: (formState, form) => {
          dialogProps.formOptions?.onFormSubmit?.(formState, form)
          submitValue(formState.values)
          hideDialog(dialogProps.dialogKey)
        },
      }}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        submitValue(undefined)
      }}
    />
  )
}

interface AskForValueProps<T extends AnyObject> {
  dialogKey: DialogKey
  submitValue: (value: T | undefined) => void
}

function askForValue<T extends AnyObject>(
  AskDialog: ComponentType<AskForValueProps<T>>,
): Promise<T>

function askForValue<T extends AnyObject, P>(
  AskDialog: ComponentType<AskForValueProps<T> & P>,
  dialogProps: P,
): Promise<T>

function askForValue<T extends AnyObject, P>(
  AskDialog: ComponentType<AskForValueProps<T> & P>,
  dialogProps?: P,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const dialogKey = getUniqueId()

    showDialog(
      dialogKey,
      <AskDialog
        {...(dialogProps as P)}
        dialogKey={dialogKey}
        submitValue={(value) => {
          if (value === undefined) {
            reject(new Error('Value not provided'))
          } else {
            resolve(value)
          }
        }}
      />,
    )
  })
}

export {
  AskForValueDialog,
  type AskForValueDialogProps,
  type AskForValueProps,
  askForValue,
}
