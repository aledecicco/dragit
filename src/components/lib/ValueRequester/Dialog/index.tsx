import type { ComponentType } from 'react'

import { hideDialog, showDialog } from '@/state/dialogs'
import { getUniqueId } from '@/state/ids'
import { FormDialog, type FormDialogProps } from '@/ui/FormDialog'
import type { AnyObject, RequireOnly } from '@/utils/types'

import { requestValue, type ValueRequesterProps } from '..'

type ValueRequesterDialogProps<T extends AnyObject> = RequireOnly<
  FormDialogProps<T>,
  'dialogKey' | 'formOptions'
> &
  ValueRequesterProps<T>

/**
 * A dialog that implements the ValueRequester interface,
 * by rendering a {@link FormDialog} and passing the submitted form values to the submit callback.
 */
const ValueRequesterDialog = <T extends AnyObject>(
  props: ValueRequesterDialogProps<T>,
) => {
  const { submitValue, ...formDialogProps } = props

  return (
    <FormDialog
      {...formDialogProps}
      formOptions={{
        ...formDialogProps.formOptions,
        onFormSubmit: (formState, form) => {
          formDialogProps.formOptions?.onFormSubmit?.(formState, form)
          submitValue(formState.values)
        },
      }}
      onClose={(e) => {
        formDialogProps.onClose?.(e)
        submitValue(undefined)
      }}
    />
  )
}

/**
 * Opens a dialog component that asks the user for a value.
 * Creates a promise that resolves when the user submits the value from the dialog.
 *
 * @param DialogComponent - The dialog component to render, that must accept a submit callback.
 * @param dialogProps - Optional props to pass to the dialog component.
 *
 * @returns A promise that resolves with the value provided by the user.
 */
function requestValueFromDialog<T>(
  DialogComponent: ComponentType<ValueRequesterProps<T>>,
): Promise<T>

function requestValueFromDialog<T extends AnyObject, P>(
  DialogComponent: ComponentType<ValueRequesterProps<T> & P>,
  dialogProps: Omit<P, 'dialogKey' | 'submitValue'>,
): Promise<T>

function requestValueFromDialog<T extends AnyObject, P>(
  DialogComponent: ComponentType<ValueRequesterProps<T> & P>,
  dialogProps?: P,
): Promise<T> {
  return requestValue(({ submitValue }) => {
    const dialogKey = getUniqueId()
    showDialog(dialogKey, DialogComponent, {
      ...(dialogProps as P),
      dialogKey,
      submitValue: (value) => {
        submitValue(value)
        hideDialog(dialogKey)
      },
    })
  })
}

export {
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
  requestValueFromDialog,
}
