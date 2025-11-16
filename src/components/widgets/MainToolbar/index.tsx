import type { WorktreeFileType } from '@/api/models'
import { useStageFiles } from '@/api/mutations/addToIndex'
import { useCommitIndex } from '@/api/mutations/commitIndex'
import { useUnstageFiles } from '@/api/mutations/removeFromIndex'
import { useSaveStash } from '@/api/mutations/saveStash'
import { showCommitDialog } from '@/common/CommitDialog'
import { FileSelectorDialog } from '@/common/FileSelectorDialog'
import { runAction } from '@/context/actions'
import { askForValue } from '@/lib/AskForValueDialog'
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

            askForValue(FileSelectorDialog, {
              types,
            }).then((filesParam) => {
              runAction(stageFiles, [filesParam.path])
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

            askForValue(FileSelectorDialog, {
              types,
            }).then((filesParam) => {
              runAction(unstageFiles, [filesParam.path])
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

            askForValue(FileSelectorDialog, {
              types,
            }).then((filesParam) => {
              runAction(saveStash, [filesParam.path])
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
            showCommitDialog()
          },
        }}
      />
    </Toolbar>
  )
}

export { MainToolbar, type MainToolbarProps }
