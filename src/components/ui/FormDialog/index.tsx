import { Dialog, type DialogProps } from '@ui/Dialog'
import { Form, type FormProps } from '@ui/Form'
import {
  FormSubmitButton,
  type FormSubmitButtonProps,
} from '@ui/Form/SubmitButton'
import type { AnyObject } from '@utils/types'

interface FormDialogProps<T extends AnyObject> extends DialogProps {
  form: FormProps<T>
  submitProps?: Partial<FormSubmitButtonProps>
}

const FormDialog = <T extends AnyObject>(props: FormDialogProps<T>) => {
  const { form, submitProps, children, ...dialogProps } = props

  return (
    <Dialog {...dialogProps}>
      <Form {...form}>
        {children}

        <FormSubmitButton {...submitProps}>Accept</FormSubmitButton>
      </Form>
    </Dialog>
  )
}

export { FormDialog, type FormDialogProps }
