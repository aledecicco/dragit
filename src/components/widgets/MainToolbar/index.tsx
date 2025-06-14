import {
  IconListCheck,
  IconMessageCheck,
  IconPackage,
} from '@tabler/icons-react'

import type { FileType } from '@/api/models'
import { useAddToIndex, useCommitIndex, useSaveStash } from '@/api/mutations'
import { CommitDialog } from '@/common/CommitDialog'
import { FileSelectorDialog } from '@/common/FileSelectorDialog'
import { askForValue } from '@/lib/AskForValueDialog'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'

interface MainToolbarProps extends Partial<ToolbarProps> {}

/**
 * Main app widget that displays a toolbar with the most important actions for file handling.
 */
const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const add = useAddToIndex()
  const commit = useCommitIndex()
  const stash = useSaveStash()

  const tools = [
    {
      action: {
        run: async () => {
          const types: FileType[] = ['unstaged', 'unmerged', 'untracked']
          const fileParams = await askForValue(FileSelectorDialog, {
            types,
          })
          await add.mutateAsync({
            files: [fileParams.path],
          })
        },
        label: {
          idle: 'Add Files',
          running: 'Adding',
          success: 'Added',
          error: 'Failed',
        },
        Glyph: IconListCheck,
      },
    },
    {
      action: {
        run: () => {
          return stash.mutateAsync({
            files: ['.'],
            message: null,
            includeUntracked: true,
          })
        },
        label: {
          idle: 'Stash',
          running: 'Stashing',
          success: 'Stashed',
          error: 'Failed',
        },
        Glyph: IconPackage,
      },
    },
    {
      action: {
        run: async () => {
          const commitParams = await askForValue(CommitDialog)
          return await commit.mutateAsync({
            message: commitParams.message,
            isAmend: false,
          })
        },
        label: {
          idle: 'Commit',
          running: 'Committing',
          success: 'Committed',
          error: 'Failed',
        },
        Glyph: IconMessageCheck,
      },
    },
  ]

  return (
    <Toolbar
      status="primary"
      size="md"
      compact={false}
      fixed
      tools={tools}
      {...toolbarProps}
    />
  )
}

export { MainToolbar, type MainToolbarProps }
