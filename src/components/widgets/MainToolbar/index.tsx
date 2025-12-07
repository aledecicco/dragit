import { useStageFiles } from '@/api/mutations/addToIndex'
import { useCommitIndex } from '@/api/mutations/commitIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useSaveStash } from '@/api/mutations/saveStash'
import { requestCommitParams } from '@/common/CommitDialog'
import { requestFilePath } from '@/common/FileSelectorDialog'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'

import { STAGED_FILE_TYPES } from '../WorktreeChanges/Staged'
import { UNSTAGED_FILE_TYPES } from '../WorktreeChanges/Unstaged'

interface MainToolbarProps extends Partial<ToolbarProps> {}

/**
 * Main app widget that displays a toolbar with the most important actions for file handling.
 */
const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const stageFiles = useStageFiles()
  const unstageFiles = useUnstageFiles()
  const saveStash = useSaveStash()
  const commit = useCommitIndex()

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        action={stageFiles}
        argsRequester={() => requestFilePath(UNSTAGED_FILE_TYPES)}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        action={unstageFiles}
        argsRequester={() => requestFilePath(STAGED_FILE_TYPES)}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        action={saveStash}
        argsRequester={() => requestFilePath(UNSTAGED_FILE_TYPES)}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        action={commit}
        argsRequester={requestCommitParams}
      />
    </Toolbar>
  )
}

export { MainToolbar, type MainToolbarProps }
