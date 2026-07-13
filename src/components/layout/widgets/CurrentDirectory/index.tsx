import { IconSettings } from '@tabler/icons-react'

import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { showSettingsDialog } from '@/common/SettingsDialog'
import {
  useChangeFolderInteraction,
  useOpenSomeRecentFolderInteraction,
} from '@/interactions/folder'
import { useStorage } from '@/state/storage'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { cn, propsWithCn } from '@/utils/styles'

interface CurrentDirectoryProps extends ToolbarProps {}

/**
 * Main app widget that displays the current directory path and allows the user to open a new one.
 */
const CurrentDirectory = (props: CurrentDirectoryProps) => {
  const { ...toolbarProps } = props

  const currentDirQuery = useQueryCurrentDir()
  const changeFolder = useChangeFolderInteraction()
  const openRecentFolder = useOpenSomeRecentFolderInteraction()

  const { recentFolders } = useStorage()
  const recentOptions = recentFolders.filter(
    (recentFolder) => recentFolder !== currentDirQuery.data?.path,
  )

  return (
    <Toolbar
      {...propsWithCn(
        toolbarProps,
        'bg-dark-700/60 backdrop-blur-sm rounded-full',
        'border border-light-50/8 border-t-light-50/16',
        'shadow-sm shadow-black/20',
      )}
    >
      <ToolbarItem
        label="View settings"
        Glyph={IconSettings}
        onClick={() => {
          showSettingsDialog()
        }}
        status="primary"
        variant="plain"
        size="lg"
        round
        compact
        className={cn('text-primary-200 p-1.5 not-last:border-r-0')}
      />

      <ToolbarItem
        {...changeFolder}
        alternatives={recentOptions.map((folder) => openRecentFolder(folder))}
        className={cn('font-medium', !currentDirQuery.data && 'italic')}
        menuButtonProps={{
          label: 'View recent folders',
          disabled: !recentOptions.length,
          className: cn('rounded-r-full pr-2'),
        }}
        variant="plain"
        status="primary"
        size="md"
        aria-label="Select and open a folder in your system"
        disabled={currentDirQuery.isFetching}
      />
    </Toolbar>
  )
}

export { CurrentDirectory }
