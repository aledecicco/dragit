import * as Ariakit from '@ariakit/react'

import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn, propsWithCn } from '@/utils/styles'

import { LARGE_DIFF_THRESHOLD } from '../FileViewer/Diff'
import { CheckboxSetting } from './CheckboxSetting'
import { SettingsDialogSection } from './Section'
import { TextSetting } from './TextSetting'

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
              <SettingsDialogSection label="Behavior" className={cn('mb-4')}>
                <TextSetting
                  label="File opener application"
                  setting="fileOpenerApp"
                  contentBefore="Use "
                  contentAfter=" to open files externally"
                />

                <CheckboxSetting
                  label="Open last folder on start"
                  setting="openLastOnStart"
                />

                <CheckboxSetting
                  label="Confirm dangerous actions"
                  setting="confirmDangerousActions"
                  description="e.g. deleting branches, force pushing"
                />
                <CheckboxSetting
                  label="Auto-refresh remote"
                  setting="autoFetchRemote"
                  description="Periodically fetch changes from the remote repository to keep it up to date"
                />
              </SettingsDialogSection>

              <SettingsDialogSection label="Appearance" className={cn('mb-4')}>
                <CheckboxSetting
                  label="Relative timestamps"
                  setting="relativeTimestamps"
                  description="e.g. '2 hours ago' instead of exact date"
                />
                <CheckboxSetting
                  label="Sort branches by latest activity date"
                  setting="sortBranchesByDate"
                />
                <CheckboxSetting
                  label="Stashes open by default"
                  description="Show the stashes list expanded by default"
                  setting="stashesOpenByDefault"
                />
              </SettingsDialogSection>

              <SettingsDialogSection label="Diffs" className={cn('mb-4')}>
                <CheckboxSetting
                  label="Prefer inline diffs"
                  description="Show inline diffs instead of side-by-side diffs by default"
                  setting="preferInline"
                />
                <CheckboxSetting
                  label="Show large diffs"
                  description={`Load diffs with more than ${LARGE_DIFF_THRESHOLD} lines by default`}
                  setting="showLargeDiffs"
                />
                <CheckboxSetting
                  label="Show word diffs"
                  description="Highlight changed words in modified lines"
                  setting="showWordDiffs"
                />
              </SettingsDialogSection>

              <SettingsDialogSection label="Shortcuts">
                <TextSetting
                  label="Stage all"
                  setting="stageAllShortcut"
                  contentBefore="Press "
                  contentAfter=" to stage all changes"
                />
                <TextSetting
                  label="Commit"
                  setting="commitShortcut"
                  contentBefore="Press "
                  contentAfter=" to open the commit dialog"
                />
                <TextSetting
                  label="Push"
                  setting="pushShortcut"
                  contentBefore="Press "
                  contentAfter=" to push changes on the current branch"
                />
                <TextSetting
                  label="Pull"
                  setting="pullShortcut"
                  contentBefore="Press "
                  contentAfter=" to pull changes from the current branch"
                />
                <TextSetting
                  label="Refresh remote"
                  setting="refreshShortcut"
                  contentBefore="Press "
                  contentAfter=" to fetch changes from the remote"
                />
                <TextSetting
                  label="Focus unstaged changes"
                  setting="focusUnstagedShortcut"
                  contentBefore="Press "
                  contentAfter=" to focus the unstaged changes list"
                />
                <TextSetting
                  label="Focus staged changes"
                  setting="focusStagedShortcut"
                  contentBefore="Press "
                  contentAfter=" to focus the staged changes list"
                />
                <TextSetting
                  label="Focus branches"
                  setting="focusBranchesShortcut"
                  contentBefore="Press "
                  contentAfter=" to focus the branches list"
                />
                <TextSetting
                  label="Focus stashes"
                  setting="focusStashesShortcut"
                  contentBefore="Press "
                  contentAfter=" to focus the stashes list"
                />
                <TextSetting
                  label="Focus graph"
                  setting="focusGraphShortcut"
                  contentBefore="Press "
                  contentAfter=" to focus the graph view"
                />
              </SettingsDialogSection>
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
