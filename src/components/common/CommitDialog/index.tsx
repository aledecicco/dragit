import { useCommitIndex } from '@/api/mutations/commitIndex'
import { showDialog } from '@/context/dialogs'
import type { DialogProps } from '@/ui/Dialog'
import { TextField } from '@/ui/Form/TextField'
import { FormDialog } from '@/ui/FormDialog'

const COMMIT_DIALOG_KEY = 'commit_dialog'

interface CommitDialogProps extends Omit<DialogProps, 'dialogKey'> {}

interface CommitFormValues {
  message: string
  isAmend: boolean
}

// TODO: https://ariakit.org/examples/combobox-textarea

/**
 * Dialog that allows the user to commit changes.
 */
const CommitDialog = (props: CommitDialogProps) => {
  const { ...dialogProps } = props
  const defaultValues: CommitFormValues = { message: '', isAmend: false }
  const commit = useCommitIndex()

  return (
    <FormDialog
      dialogKey={COMMIT_DIALOG_KEY}
      formOptions={{
        defaultValues,
        formAction: commit,
      }}
      {...dialogProps}
    >
      <TextField label="Commit Message" name="message" autoFocus required />
    </FormDialog>
  )
}

const showCommitDialog = (props?: Partial<CommitDialogProps>) => {
  showDialog(COMMIT_DIALOG_KEY, <CommitDialog {...props} />)
}

export { CommitDialog, showCommitDialog, type CommitDialogProps }
