import type { WorktreeFileType } from '@/api/models'
import { useStageFiles } from '@/api/mutations/addToIndex'
import { useCommitIndex } from '@/api/mutations/commitIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useSaveStash } from '@/api/mutations/saveStash'
import { requestCommitParams } from '@/common/CommitDialog'
import { requestFilePath } from '@/common/FileSelectorDialog'
import { runAction } from '@/context/actions'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'

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
        tool={{
          mainAction: stageFiles,
          trackOnly: true,
          onClick: () => {
            const types: WorktreeFileType[] = [
              'unstaged',
              'unmerged',
              'untracked',
            ]

            requestFilePath(types).then((path) => {
              runAction(stageFiles, [path])
            })
          },
        }}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        tool={{
          mainAction: unstageFiles,
          trackOnly: true,
          onClick: () => {
            const types: WorktreeFileType[] = ['staged']

            requestFilePath(types).then((path) => {
              runAction(unstageFiles, [path])
            })
          },
        }}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        tool={{
          mainAction: saveStash,
          trackOnly: true,
          onClick: () => {
            const types: WorktreeFileType[] = [
              'unstaged',
              'unmerged',
              'untracked',
            ]

            requestFilePath(types).then((path) => {
              runAction(saveStash, [path])
            })
          },
        }}
      />

      <ToolbarItem
        status="primary"
        size="md"
        compact={false}
        fixed
        tool={{
          mainAction: commit,
          trackOnly: true,
          onClick: () => {
            requestCommitParams().then((commitParams) => {
              runAction(commit, commitParams)
            })
          },
        }}
      />
    </Toolbar>
  )
}

export { MainToolbar, type MainToolbarProps }
