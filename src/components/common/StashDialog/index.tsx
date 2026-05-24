import { IconPackage } from '@tabler/icons-react'

import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { TextField } from '@/ui/Form/TextField'
import { cn } from '@/utils/styles'

interface StashDialogProps extends ValueRequesterDialogProps<StashFormValues> {}

interface StashFormValues {
  message: string
}

/**
 * Dialog that allows the user to stash changes.
 */
const StashDialog = (props: StashDialogProps) => {
  const { ...dialogProps } = props

  return (
    <ValueRequesterDialog {...dialogProps}>
      <DialogContent heading="Stash Changes">
        <TextField label="stash message" name="message" autoFocus />

        <DecoratedButton
          type="submit"
          label="Stash"
          Glyph={IconPackage}
          className={cn('w-full mt-6')}
          status="primary"
        />
      </DialogContent>
    </ValueRequesterDialog>
  )
}

const requestStashParams = (defaultMessage?: string) =>
  requestValueFromDialog(StashDialog, {
    formOptions: {
      defaultValues: {
        message: defaultMessage ?? '',
      },
    },
  })

export { StashDialog, requestStashParams, type StashDialogProps }
