import { useEffect } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconMessageCheck, IconMessageCog } from '@tabler/icons-react'

import { useQueryGeneratedCommitMessage } from '@/api/queries/generatedMessage'
import { useGenerateCommitMessageInteraction } from '@/interactions/ai'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
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
    <ValueRequesterDialog {...dialogProps}>
      <DialogContent heading={isAmend ? 'Amend Commit' : 'Commit Changes'}>
        <TextField label="commit message" name="message" autoFocus required>
          {!isAmend && <AiGenerationButton />}
        </TextField>

        <DecoratedButton
          type="submit"
          label={isAmend ? 'Amend Commit' : 'Commit'}
          Glyph={isAmend ? IconMessageCog : IconMessageCheck}
          className={cn('w-full mt-6')}
          status="primary"
        />
      </DialogContent>
    </ValueRequesterDialog>
  )
}

const AiGenerationButton = () => {
  const form = Ariakit.useFormContext()

  const generateMessage = useGenerateCommitMessageInteraction()
  const generatedMessageQuery = useQueryGeneratedCommitMessage()

  useEffect(() => {
    if (generatedMessageQuery.data) {
      form?.setValue('message', generatedMessageQuery.data)
    }
  }, [generatedMessageQuery.data, form?.setValue])

  return (
    <ActionButton
      {...generateMessage}
      className={cn(
        'absolute bottom-2 right-2',
        'opacity-80 hover:opacity-100 focus:opacity-100',
        'border border-light-950/30',
      )}
      status="neutral"
      variant="filled"
      size="sm"
      compact
    />
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
