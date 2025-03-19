import { useCommitIndex } from '@api/commands'
import { showDialog } from '@context/dialogs'
import { TextField } from '@ui/Form/TextField'
import { FormDialog, type FormDialogProps } from '@ui/FormDialog'
import type { PickPartial } from '@utils/types'

interface CommitFormValues {
  message: string
}

interface CommitDialogProps
  extends PickPartial<FormDialogProps<CommitFormValues>, 'dialogKey'> {}

// TODO: https://ariakit.org/examples/combobox-textarea

const CommitDialog = (props: CommitDialogProps) => {
  const { ...dialogProps } = props
  const commit = useCommitIndex()

  return (
    <FormDialog
      heading="Commit"
      form={{
        defaultValues: { message: '' },
        onFormSubmit: (form) => {
          const message = form.values.message
          commit.mutate({ message, isAmend: false })
        },
      }}
      {...dialogProps}
      dialogKey={dialogProps.dialogKey}
    >
      <TextField label="Commit Message" name="message" autoFocus required />
    </FormDialog>
  )
}

const COMMIT_DIALOG_KEY = 'commit'

const showCommitDialog = (
  dialogProps?: Partial<Omit<CommitDialogProps, 'dialogKey'>>,
) =>
  showDialog(
    COMMIT_DIALOG_KEY,
    <CommitDialog {...dialogProps} dialogKey={COMMIT_DIALOG_KEY} />,
  )

export { CommitDialog, type CommitDialogProps, showCommitDialog }
