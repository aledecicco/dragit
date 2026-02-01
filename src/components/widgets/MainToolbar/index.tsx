import { useStageFiles } from '@/api/mutations/addToIndex'
import { useCommitIndex } from '@/api/mutations/commitIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useStashFiles } from '@/api/mutations/saveStash'
import { useQueryWorktreeFiles } from '@/api/queries/worktreeFiles'
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

  const stagedFilesQuery = useQueryWorktreeFiles(STAGED_FILE_TYPES)
  const unstagedFilesQuery = useQueryWorktreeFiles(UNSTAGED_FILE_TYPES)

  const stageFiles = useStageFiles()
  const unstageFiles = useUnstageFiles()
  const stashFiles = useStashFiles()
  const commit = useCommitIndex()

  return (
    <Toolbar {...toolbarProps} fixed>
      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        action={stageFiles}
        argsRequester={async () => {
          const filepath = await requestFilePath(UNSTAGED_FILE_TYPES)

          if (filepath === '.') {
            return unstagedFilesQuery.data?.items || []
          }

          const file = unstagedFilesQuery.data?.items.find(
            (file) => file.path === filepath,
          )

          if (!file) {
            throw new Error('File not found')
          }

          return [file]
        }}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        action={unstageFiles}
        argsRequester={async () => {
          const filepath = await requestFilePath(STAGED_FILE_TYPES)

          if (filepath === '.') {
            return stagedFilesQuery.data?.items || []
          }

          const file = stagedFilesQuery.data?.items.find(
            (file) => file.path === filepath,
          )

          if (!file) {
            throw new Error('File not found')
          }

          return [file]
        }}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        action={stashFiles}
        argsRequester={async () => {
          const filepath = await requestFilePath(UNSTAGED_FILE_TYPES)

          if (filepath === '.') {
            return unstagedFilesQuery.data?.items || []
          }

          const file = unstagedFilesQuery.data?.items.find(
            (file) => file.path === filepath,
          )

          if (!file) {
            throw new Error('File not found')
          }

          return [file]
        }}
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
