import { hideDialog } from '@/context/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { Form, type FormProps } from '@/ui/Form'
import {
  FormSubmitButton,
  type FormSubmitButtonProps,
} from '@/ui/Form/SubmitButton'
import type { AnyObject } from '@/utils/types'

interface FormDialogProps<T extends AnyObject> extends DialogProps {
  /**
   * Options for the form contained in the dialog.
   */
  formOptions: FormProps<T>

  /**
   * Props for the submit button.
   */
  submitProps?: Partial<FormSubmitButtonProps<T>>
}

/**
 * A dialog whose purpose is to display a form, that is hidden when the form is successfully submitted.
 */
const FormDialog = <T extends AnyObject>(props: FormDialogProps<T>) => {
  const { formOptions, submitProps, children, ...dialogProps } = props

  return (
    <Dialog {...dialogProps}>
      <Form
        {...formOptions}
        onFormSubmit={(formState, form) => {
          formOptions.onFormSubmit?.(formState, form)
          hideDialog(dialogProps.dialogKey)
        }}
      >
        {(action) => (
          <>
            {children}

            <FormSubmitButton action={action} {...submitProps}>
              Accept
            </FormSubmitButton>
          </>
        )}
      </Form>
    </Dialog>
  )
}

export { FormDialog, type FormDialogProps }
