import * as Ariakit from '@ariakit/react'

import { useSetSettings } from '@/api/mutations/setSettings'
import { triggerInteraction } from '@/state/actions'
import { showDialog } from '@/state/dialogs'
import { useSettings } from '@/state/settings'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { EditableText } from '@/ui/EditableText'
import { Checkbox } from '@/ui/Form/Checkbox'
import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'

import { LARGE_DIFF_THRESHOLD } from '../FileViewer/Diff'

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
        className={cn('h-full grid grid-rows-[max-content_1fr]')}
      >
        <div className={cn('overflow-hidden h-full')}>
          <Ariakit.CompositeProvider orientation="vertical" focusLoop>
            <Ariakit.Composite
              render={
                <div
                  className={cn(
                    'p-2 rounded-md bg-dark-800 h-full overflow-auto',
                  )}
                />
              }
            >
              <Separator label="Behavior" className={cn('mb-2')} />

              <div className={cn('grid auto-rows-fr')}>
                <div
                  className={cn(
                    'flex flex-row gap-1.5 items-center p-2',
                    'text-sm text-light-400',
                    'hover:bg-light-950/5 data-focus-visible:bg-light-950/5',
                    'hover:data-focus-visible:bg-light-950/10',
                  )}
                >
                  Use
                  <Ariakit.CompositeItem
                    render={(props) => (
                      <EditableText
                        label="File opener application"
                        value={settings.fileOpenerApp}
                        setValue={(app) => {
                          triggerInteraction({
                            action: setSettings,
                            argsRequester: () => ({ fileOpenerApp: app }),
                          })
                        }}
                        className={cn(
                          'max-w-20 border border-dark-50 rounded-md',
                        )}
                        buttonProps={{
                          className: cn('max-w-20'),
                          ...props,
                        }}
                      />
                    )}
                  />{' '}
                  to open files externally
                </div>

                <Checkbox
                  label="Open last folder on start"
                  checked={settings.openLastOnStart}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        openLastOnStart: e.target.checked,
                      }),
                    })
                  }}
                />

                <Checkbox
                  label="Confirm dangerous actions"
                  description="e.g. deleting branches, force pushing"
                  checked={settings.confirmDangerousActions}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        confirmDangerousActions: e.target.checked,
                      }),
                    })
                  }}
                />

                <Checkbox
                  label="Auto-refresh remote"
                  description="Periodically fetch changes from the remote repository to keep it up to date"
                  checked={settings.autoFetchRemote}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        autoFetchRemote: e.target.checked,
                      }),
                    })
                  }}
                />
              </div>

              <Separator label="Appearance" className={cn('mt-4 mb-2')} />

              <div className={cn('grid auto-rows-fr')}>
                <Checkbox
                  label="Relative timestamps"
                  description="e.g. '2 hours ago' instead of exact date"
                  checked={settings.relativeTimestamps}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        relativeTimestamps: e.target.checked,
                      }),
                    })
                  }}
                />

                <Checkbox
                  label="Sort branches by latest activity date"
                  checked={settings.sortBranchesByDate}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        sortBranchesByDate: e.target.checked,
                      }),
                    })
                  }}
                />

                <Checkbox
                  label="Stashes open by default"
                  description="Show the stashes list expanded by default"
                  checked={settings.stashesOpenByDefault}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        stashesOpenByDefault: e.target.checked,
                      }),
                    })
                  }}
                />
              </div>

              <Separator label="Diffs" className={cn('mt-4 mb-2')} />

              <div className={cn('grid auto-rows-fr')}>
                <Checkbox
                  label="Prefer inline diffs"
                  description="Show inline diffs instead of side-by-side diffs by default"
                  checked={settings.preferInline}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({ preferInline: e.target.checked }),
                    })
                  }}
                />

                <Checkbox
                  label="Show large diffs"
                  description={`Load diffs with more than ${LARGE_DIFF_THRESHOLD} lines by default`}
                  checked={settings.showLargeDiffs}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        showLargeDiffs: e.target.checked,
                      }),
                    })
                  }}
                />

                <Checkbox
                  label="Show word diffs"
                  description="Highlight changed words in modified lines"
                  checked={settings.showWordDiffs}
                  onChange={(e) => {
                    triggerInteraction({
                      action: setSettings,
                      argsRequester: () => ({
                        showWordDiffs: e.target.checked,
                      }),
                    })
                  }}
                />
              </div>
            </Ariakit.Composite>
          </Ariakit.CompositeProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const showSettingsDialog = (props?: Partial<SettingsDialogProps>) => {
  showDialog(SETTINGS_DIALOG_KEY, SettingsDialog, props ?? {})
}

export { SettingsDialog, showSettingsDialog, type SettingsDialogProps }
