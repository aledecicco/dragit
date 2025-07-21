import type { FileType } from '@/api/models'
import { useAddFiles, useCommitIndex, useQuickStash } from '@/api/mutations'
import { showCommitDialog } from '@/common/CommitDialog'
import { FileSelectorDialog } from '@/common/FileSelectorDialog'
import { runAction } from '@/context/actions'
import { askForValue } from '@/lib/AskForValueDialog'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'

interface MainToolbarProps extends Partial<ToolbarProps> {}

/**
 * Main app widget that displays a toolbar with the most important actions for file handling.
 */
const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const addFiles = useAddFiles()
  const quickStash = useQuickStash()
  const commit = useCommitIndex()

  return (
    <Toolbar
      status="primary"
      size="md"
      compact={false}
      fixed
      tools={[
        {
          mainAction: addFiles,
          trackOnly: true,
          onClick: () => {
            const types: FileType[] = ['unstaged', 'unmerged', 'untracked']

            askForValue(FileSelectorDialog, {
              types,
            }).then((filesParam) => {
              runAction(addFiles, [filesParam.path])
            })
          },
        },
        { mainAction: quickStash },
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
