import {
  AskForValueDialog,
  type AskForValueDialogProps,
  type AskProps,
} from '@lib/AskForValueDialog'
import { TextField } from '@ui/Form/TextField'

interface CommitFormValues {
  message: string
}

interface CommitDialogProps extends AskProps<CommitFormValues> {}

// TODO: https://ariakit.org/examples/combobox-textarea

const CommitDialog = (props: CommitDialogProps) => {
  const { ...dialogProps } = props

  return (
    <AskForValueDialog
      heading="Commit"
      defaultValues={{ message: '' }}
      {...dialogProps}
      dialogKey={dialogProps.dialogKey}
    >
      <TextField label="Commit Message" name="message" autoFocus required />
    </AskForValueDialog>
  )
}

export { CommitDialog, type CommitDialogProps }
