import * as Ariakit from '@ariakit/react'

import { LARGE_DIFF_THRESHOLD } from '@/common/FileViewer/Diff'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn } from '@/utils/styles'

import { CheckboxSetting } from '../CheckboxSetting'
import { PerRepositoryPreferences } from '../PerRepository'
import { SettingsDialogSection } from '../Section'
import { ShortcutSetting } from '../ShortcutSetting'
import { TextSetting } from '../TextSetting'

/**
 * The content of the preferences section of the settings dialog.
 */
const SettingsDialogPreferencesContent = () => {
  return (
    <DialogContent
      heading="Preferences"
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
            <SettingsDialogSection label="Behavior">
              <TextSetting
                label="File opener application"
                placeholder="..."
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
              <CheckboxSetting
                label="Ask for stash message"
                setting="askForStashMessage"
                description="Prompt for a description message when stashing changes"
              />
            </SettingsDialogSection>

            <PerRepositoryPreferences />

            <SettingsDialogSection label="Appearance">
              <CheckboxSetting
                label="Show shortcut indicators"
                setting="showShortcutIndicators"
                description="Display indicators for available keyboard shortcuts on interactive elements"
              />
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

            <SettingsDialogSection label="Diffs">
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
              <ShortcutSetting
                action="choose changes to stage"
                setting="stageFilesShortcut"
              />
              <ShortcutSetting
                action="choose changes to unstage"
                setting="unstageFilesShortcut"
              />
              <ShortcutSetting
                action="choose changes to stash"
                setting="stashFilesShortcut"
              />

              <ShortcutSetting
                action="open the branch switcher"
                setting="checkoutShortcut"
              />
              <ShortcutSetting
                action="change the comparison branch"
                setting="changeBaseShortcut"
              />

              <ShortcutSetting
                action="open the commit dialog"
                setting="commitShortcut"
              />
              <ShortcutSetting
                action="amend the last commit"
                setting="amendShortcut"
              />
              <ShortcutSetting
                action="push changes to the current branch"
                setting="pushShortcut"
              />
              <ShortcutSetting
                action="pull changes from the current branch"
                setting="pullShortcut"
              />
              <ShortcutSetting
                action="fetch changes from the remote"
                setting="refreshShortcut"
              />

              <ShortcutSetting
                action="focus the main view"
                setting="focusMainShortcut"
              />
              <ShortcutSetting
                action="focus the unstaged changes list"
                setting="focusUnstagedShortcut"
              />
              <ShortcutSetting
                action="focus the staged changes list"
                setting="focusStagedShortcut"
              />
              <ShortcutSetting
                action="focus the branches list"
                setting="focusBranchesShortcut"
              />
              <ShortcutSetting
                action="focus the stashes list"
                setting="focusStashesShortcut"
              />
              <ShortcutSetting
                action="close an open file diff"
                setting="closeFileDiffShortcut"
              />
            </SettingsDialogSection>
          </Ariakit.Composite>
        </Ariakit.CompositeProvider>
      </div>
    </DialogContent>
  )
}

export { SettingsDialogPreferencesContent }
