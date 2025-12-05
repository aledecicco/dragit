import { hideDialog } from '@/context/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { Form, type FormProps } from '@/ui/Form'
import type { AnyObject, RequireOnly } from '@/utils/types'

interface FormDialogProps<T extends AnyObject> extends DialogProps {
  /**
   * Options for the form contained in the dialog.
   */
  formOptions: RequireOnly<FormProps<T>, 'defaultValues'>
}

/**
 * A dialog whose purpose is to display a form, that is hidden when the form is successfully submitted.
 */
const FormDialog = <T extends AnyObject>(props: FormDialogProps<T>) => {
  const { formOptions, children, ...dialogProps } = props

  return (
    <Dialog {...dialogProps}>
      <Form
        {...formOptions}
        onFormSubmit={async (formState, form) => {
          await formOptions.onFormSubmit?.(formState, form)
          hideDialog(dialogProps.dialogKey)
        }}
      >
        {children}
      </Form>
    </Dialog>
  )
}

export { FormDialog, type FormDialogProps }
