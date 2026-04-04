import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn, propsWithCn } from '@/utils/styles'

const SETTINGS_DIALOG_KEY = 'settings_dialog'

interface SettingsDialogProps extends Omit<DialogProps, 'dialogKey'> {}

/**
 * Dialog that displays existing settings and allows managing them.
 */
const SettingsDialog = (props: SettingsDialogProps) => {
  const { ...dialogProps } = props

  return (
    <Dialog
      dialogKey={SETTINGS_DIALOG_KEY}
      {...propsWithCn(dialogProps, 'grid-cols-[600px] max-h-half')}
    >
      <DialogContent
        heading="Settings"
        className={cn('h-full grid grid-rows-[max-content_1fr_max-content]')}
      />
    </Dialog>
  )
}

const showSettingsDialog = (props?: Partial<SettingsDialogProps>) => {
  showDialog(SETTINGS_DIALOG_KEY, SettingsDialog, props ?? {})
}

export { SettingsDialog, showSettingsDialog, type SettingsDialogProps }
