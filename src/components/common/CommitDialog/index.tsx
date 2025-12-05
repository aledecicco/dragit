import { useCommitIndex } from '@/api/mutations/commitIndex'
import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { TextField } from '@/ui/Form/TextField'
import { cn } from '@/utils/styles'

interface CommitDialogProps
  extends ValueRequesterDialogProps<CommitFormValues> {}

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
  const commit = useCommitIndex()

  return (
    <ValueRequesterDialog heading="Commit Changes" {...dialogProps}>
      <TextField label="Commit Message" name="message" autoFocus required />

      <DecoratedButton
        type="submit"
        label={commit.label.idle}
        Glyph={commit.Glyph}
        className={cn('w-full')}
        status="primary"
      />
    </ValueRequesterDialog>
  )
}

const requestCommitParams = () =>
  requestValueFromDialog(CommitDialog, {
    formOptions: { defaultValues: { message: '', isAmend: false } },
  })

export { CommitDialog, requestCommitParams, type CommitDialogProps }
