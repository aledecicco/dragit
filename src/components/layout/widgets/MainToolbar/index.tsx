import { useStageFiles } from '@/api/mutations/addToIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useStashFiles } from '@/api/mutations/saveStash'
import { requestWorktreeFiles } from '@/common/FileSelectorDialog'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { useSettings } from '@/state/settings'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'

import { NOT_STAGED_FILE_TYPES } from '../WorktreeChanges/NotStaged'
import { STAGED_FILE_TYPES } from '../WorktreeChanges/Staged'

interface MainToolbarProps extends Partial<Omit<ToolbarProps, 'fixed'>> {}

/**
 * Main app widget that displays a toolbar with the most important actions for file handling.
 */
const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const stageFiles = useStageFiles()
  const unstageFiles = useUnstageFiles()
  const stashFiles = useStashFiles()

  const settings = useSettings()

  useShortcutBinding(settings.stageFilesShortcut, () => {
    triggerInteraction({
      action: stageFiles,
      argsRequester: () => requestWorktreeFiles(NOT_STAGED_FILE_TYPES),
    })
  })
  useShortcutBinding(settings.unstageFilesShortcut, () => {
    triggerInteraction({
      action: unstageFiles,
      argsRequester: () => requestWorktreeFiles(STAGED_FILE_TYPES),
    })
  })
  useShortcutBinding(settings.stashFilesShortcut, () => {
    triggerInteraction({
      action: stashFiles,
      argsRequester: () => requestWorktreeFiles(NOT_STAGED_FILE_TYPES),
    })
  })

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        fixed
        status="primary"
        size="md"
        compact={false}
        action={stageFiles}
        argsRequester={() => requestWorktreeFiles(NOT_STAGED_FILE_TYPES)}
      />

      <ToolbarItem
        fixed
        status="primary"
        size="md"
        compact={false}
        action={unstageFiles}
        argsRequester={() => requestWorktreeFiles(STAGED_FILE_TYPES)}
      />

      <ToolbarItem
        fixed
        status="primary"
        size="md"
        compact={false}
        action={stashFiles}
        argsRequester={() => requestWorktreeFiles(NOT_STAGED_FILE_TYPES)}
      />
    </Toolbar>
  )
}

export { MainToolbar, type MainToolbarProps }
