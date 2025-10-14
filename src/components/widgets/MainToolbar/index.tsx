import type { WorktreeFileType } from '@/api/models'
import { useAddFiles, useCommitIndex, useSaveStash } from '@/api/mutations'
import { showCommitDialog } from '@/common/CommitDialog'
import { FileSelectorDialog } from '@/common/FileSelectorDialog'
import { runAction } from '@/context/actions'
import { ActionToolbar, type ActionToolbarProps } from '@/lib/ActionToolbar'
import { askForValue } from '@/lib/AskForValueDialog'

interface MainToolbarProps extends Partial<ActionToolbarProps> {}

/**
 * Main app widget that displays a toolbar with the most important actions for file handling.
 */
const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const addFiles = useAddFiles()
  const saveStash = useSaveStash()
  const commit = useCommitIndex()

  return (
    <ActionToolbar
      status="primary"
      size="md"
      compact={false}
      fixed
      tools={[
        {
          mainAction: addFiles,
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
              runAction(addFiles, [filesParam.path])
            })
          },
        },
        {
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
        },
        {
          mainAction: commit,
          trackOnly: true,
          onClick: () => {
            showCommitDialog()
          },
        },
      ]}
      {...toolbarProps}
    />
  )
}

export { MainToolbar, type MainToolbarProps }
