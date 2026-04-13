import { useSetSettings } from '@/api/mutations/setSettings'
import { runAction } from '@/state/actions'
import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { EditableText } from '@/ui/EditableText'
import { Checkbox } from '@/ui/Form/Checkbox'
import { useSettings } from '@/utils/app'
import { cn, propsWithCn } from '@/utils/styles'

const SETTINGS_DIALOG_KEY = 'settings_dialog'

interface SettingsDialogProps extends Omit<DialogProps, 'dialogKey'> {}

/**
 * Dialog that displays existing settings and allows managing them.
 */
const SettingsDialog = (props: SettingsDialogProps) => {
  const { ...dialogProps } = props

  const settings = useSettings()
  const setSettings = useSetSettings()

  return (
    <Dialog
      dialogKey={SETTINGS_DIALOG_KEY}
      {...propsWithCn(dialogProps, 'grid-cols-[600px] max-h-half')}
    >
      <DialogContent
        heading="Settings"
        className={cn('h-full grid grid-rows-[max-content_1fr_max-content]')}
      >
        <div className={cn('overflow-auto')}>
          <div
            className={cn('p-2 rounded-md bg-dark-800', 'grid auto-rows-fr')}
          >
            <div
              className={cn(
                'flex flex-row gap-1.5 items-center p-2',
                'text-sm text-light-400',
                'hover:bg-light-950/5 data-focus-visible:bg-light-950/5',
                'hover:data-focus-visible:bg-light-950/10',
              )}
            >
              Use
              <EditableText
                label="File opener application"
                value={settings.fileOpenerApp}
                setValue={(app) => {
                  runAction(setSettings, { fileOpenerApp: app })
                }}
                className={cn('max-w-20 border border-dark-50 rounded-md')}
                buttonProps={{
                  className: cn('max-w-20'),
                }}
              />{' '}
              to open files externally
            </div>

            <Checkbox
              label="Open last folder on start"
              checked={settings.openLastOnStart}
              onChange={(e) => {
                runAction(setSettings, { openLastOnStart: e.target.checked })
              }}
            />

            <Checkbox
              label="Confirm dangerous actions"
              description="e.g. deleting branches, force pushing"
              checked={settings.confirmDangerousActions}
              onChange={(e) => {
                runAction(setSettings, {
                  confirmDangerousActions: e.target.checked,
                })
              }}
            />

            <Checkbox
              label="Prefer inline diffs"
              description="Show inline diffs instead of side-by-side diffs by default"
              checked={settings.preferInline}
              onChange={(e) => {
                runAction(setSettings, { preferInline: e.target.checked })
              }}
            />

            <Checkbox
              label="Relative timestamps"
              description="e.g. '2 hours ago' instead of exact date"
              checked={settings.relativeTimestamps}
              onChange={(e) => {
                runAction(setSettings, { relativeTimestamps: e.target.checked })
              }}
            />

            <Checkbox
              label="Sort branches by latest activity date"
              checked={settings.sortBranchesByDate}
              onChange={(e) => {
                runAction(setSettings, { sortBranchesByDate: e.target.checked })
              }}
            />

            <Checkbox
              label="Auto-refresh remote"
              description="Periodically fetch changes from the remote repository to keep it up to date"
              checked={settings.autoFetchRemote}
              onChange={(e) => {
                runAction(setSettings, { autoFetchRemote: e.target.checked })
              }}
            />

            <Checkbox
              label="Stashes open by default"
              description="Show the stashes list expanded by default"
              checked={settings.stashesOpenByDefault}
              onChange={(e) => {
                runAction(setSettings, {
                  stashesOpenByDefault: e.target.checked,
                })
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const showSettingsDialog = (props?: Partial<SettingsDialogProps>) => {
  showDialog(SETTINGS_DIALOG_KEY, SettingsDialog, props ?? {})
}

export { SettingsDialog, showSettingsDialog, type SettingsDialogProps }
