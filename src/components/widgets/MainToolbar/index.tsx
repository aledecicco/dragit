import {
  IconListCheck,
  IconMessageCheck,
  IconPackage,
} from '@tabler/icons-react'
import { useMemo } from 'react'

import { useAddToIndex, useSaveStash } from '@api/mutations'
import { showCommitDialog } from '@common/CommitDialog'
import { selectFiles } from '@lib/FileSelectorDialog'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface MainToolbarProps extends Partial<ToolbarProps> {}

const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const add = useAddToIndex()
  const stash = useSaveStash()

  const tools = useMemo(() => {
    return [
      {
        action: {
          run: async () => {
            const path = await selectFiles({
              types: ['unstaged', 'unmerged', 'untracked'],
            })
            await add.mutateAsync({
              files: [path],
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
            // TODO
            showCommitDialog()
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
  }, [add.mutateAsync, stash.mutateAsync])

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
