import { IconMessageCheck, IconMessageCog } from '@tabler/icons-react'

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

  const isAmend = dialogProps.formOptions?.defaultValues.isAmend ?? false

  return (
    <ValueRequesterDialog heading="Commit Changes" {...dialogProps}>
      <TextField label="commit message" name="message" autoFocus required />

      <DecoratedButton
        type="submit"
        label={isAmend ? 'Amend Commit' : 'Commit'}
        Glyph={isAmend ? IconMessageCog : IconMessageCheck}
        className={cn('w-full')}
        status="primary"
      />
    </ValueRequesterDialog>
  )
}

const requestCommitParams = (defaultMessage?: string, isAmend?: boolean) =>
  requestValueFromDialog(CommitDialog, {
    formOptions: {
      defaultValues: {
        message: defaultMessage ?? '',
        isAmend: isAmend ?? false,
      },
    },
  })

export { CommitDialog, requestCommitParams, type CommitDialogProps }
