import { IconCancel, IconCheck } from '@tabler/icons-react'

import { DecoratedButton } from '@/lib/DecoratedButton'
import type { ValueRequesterProps } from '@/lib/ValueRequester'
import { requestValueFromDialog } from '@/lib/ValueRequester/Dialog'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn } from '@/utils/styles'

type ConfirmationDialogProps = DialogProps &
  ValueRequesterProps<boolean> & {
    /**
     * A description of the action to confirm.
     */
    description: string
  }

/**
 * Dialog that asks the user to confirm an action.
 */
const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { description, submitValue, ...dialogProps } = props

  return (
    <Dialog
      {...dialogProps}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        submitValue(false)
      }}
    >
      <DialogContent heading="Are You Sure?">
        <p className={cn('text-sm mb-6', 'bg-dark-950/50 p-4 rounded-md')}>
          You are about to{' '}
          <span className={cn('text-danger-600', 'wrap-anywhere')}>
            {description}
          </span>
          .
        </p>

        <div className={cn('grid grid-cols-2 gap-1')}>
          <DecoratedButton
            label="Cancel"
            Glyph={IconCancel}
            status="neutral"
            variant="filled"
            onClick={() => {
              submitValue(false)
            }}
          />
          <DecoratedButton
            label="Confirm"
            Glyph={IconCheck}
            status="danger"
            variant="filled"
            onClick={() => {
              submitValue(true)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

const askForConfirmation = (description: string) =>
  requestValueFromDialog(ConfirmationDialog, { description })

export { ConfirmationDialog, askForConfirmation, type ConfirmationDialogProps }
