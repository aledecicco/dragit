import {
  AskForValueDialog,
  type AskForValueProps,
} from '@lib/AskForValueDialog'
import { TextField } from '@ui/Form/TextField'

interface CommitFormValues {
  message: string
}

interface CommitDialogProps extends AskForValueProps<CommitFormValues> {}

// TODO: https://ariakit.org/examples/combobox-textarea

/**
 * Dialog that allows the user to commit changes.
 */
const CommitDialog = (props: CommitDialogProps) => {
  const { ...askForValueProps } = props

  return (
    <AskForValueDialog
      heading="Commit"
      defaultValues={{ message: '' }}
      {...askForValueProps}
    >
      <TextField label="Commit Message" name="message" autoFocus required />
    </AskForValueDialog>
  )
}

export { CommitDialog, type CommitDialogProps }
