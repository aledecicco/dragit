import { hideDialog } from '@context/dialogs'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { Form, type FormProps } from '@ui/Form'
import {
  FormSubmitButton,
  type FormSubmitButtonProps,
} from '@ui/Form/SubmitButton'
import type { AnyObject } from '@utils/types'

interface FormDialogProps<T extends AnyObject> extends DialogProps {
  formOptions: FormProps<T>
  submitProps?: Partial<FormSubmitButtonProps>
}

const FormDialog = <T extends AnyObject>(props: FormDialogProps<T>) => {
  const { formOptions, submitProps, children, ...dialogProps } = props

  return (
    <Dialog {...dialogProps}>
      <Form
        {...formOptions}
        onFormSubmit={(formState, form) => {
          const res = formOptions.onFormSubmit(formState, form)

          if (res) {
            res.then(() => hideDialog(dialogProps.dialogKey))
          } else {
            hideDialog(dialogProps.dialogKey)
          }
        }}
      >
        {(actionTracker) => (
          <>
            {children}

            <FormSubmitButton {...submitProps} actionTracker={actionTracker}>
              Accept
            </FormSubmitButton>
          </>
        )}
      </Form>
    </Dialog>
  )
}

export { FormDialog, type FormDialogProps }
