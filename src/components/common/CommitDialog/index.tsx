import { useEffect, useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconMessageCheck, IconMessageCog } from '@tabler/icons-react'

import { useQueryGeneratedCommitMessage } from '@/api/queries/generatedMessage'
import { useGenerateCommitMessageInteraction } from '@/interactions/ai'
import { ActionButton } from '@/lib/ActionButton'
import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { TextField } from '@/ui/Form/TextField'
import { cn, propsWithCn } from '@/utils/styles'

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
  const fieldRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <ValueRequesterDialog {...dialogProps}>
      <DialogContent heading={isAmend ? 'Amend Commit' : 'Commit Changes'}>
        <TextField
          ref={fieldRef}
          label="commit message"
          name="message"
          autoFocus
          required
          onBlur={(e) => {
            if (e.relatedTarget === buttonRef.current) {
              e.preventDefault()
            }
          }}
        >
          {!isAmend && (
            <AiGenerationButton
              ref={buttonRef}
              onClick={() => {
                fieldRef.current?.focus()
              }}
            />
          )}
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

const AiGenerationButton = (props: Partial<DecoratedButtonProps>) => {
  const { ...buttonProps } = props
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
      status="neutral"
      variant="filled"
      size="sm"
      compact
      {...propsWithCn(
        buttonProps,
        'absolute bottom-2 right-2',
        'transition-opacity duration-150',
        'opacity-80 hover:opacity-100 focus:opacity-100',
        'border border-light-950/30',
      )}
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
