import { useStageFiles } from '@/api/mutations/addToIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useStashFiles } from '@/api/mutations/saveStash'
import { requestFilePath } from '@/common/FileSelectorDialog'
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

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        fixed
        status="primary"
        size="md"
        compact={false}
        action={stageFiles}
        argsRequester={async () => {
          const filepath = await requestFilePath(NOT_STAGED_FILE_TYPES)
          return [filepath]
        }}
      />

      <ToolbarItem
        fixed
        status="primary"
        size="md"
        compact={false}
        action={unstageFiles}
        argsRequester={async () => {
          const filepath = await requestFilePath(STAGED_FILE_TYPES)
          return [filepath]
        }}
      />

      <ToolbarItem
        fixed
        status="primary"
        size="md"
        compact={false}
        action={stashFiles}
        argsRequester={async () => {
          const filepath = await requestFilePath(NOT_STAGED_FILE_TYPES)
          return [filepath]
        }}
      />
    </Toolbar>
  )
}

export { MainToolbar, type MainToolbarProps }
