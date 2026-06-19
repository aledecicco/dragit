import { useQueryCurrentDir } from '@/api/queries/currentDir'
import {
  useChangeFolderInteraction,
  useOpenSomeRecentFolderInteraction,
} from '@/interactions/folder'
import { ActionButton } from '@/lib/ActionButton'
import { useStorage } from '@/state/storage'
import type { ButtonProps } from '@/ui/Button'
import { propsWithCn } from '@/utils/styles'

interface CurrentDirectoryProps extends Partial<ButtonProps> {}

/**
 * Main app widget that displays the current directory path and allows the user to open a new one.
 */
const CurrentDirectory = (props: CurrentDirectoryProps) => {
  const { ...buttonProps } = props

  const currentDirQuery = useQueryCurrentDir()
  const changeFolder = useChangeFolderInteraction()
  const openRecentFolder = useOpenSomeRecentFolderInteraction()

  const { recentFolders } = useStorage()
  const recentOptions = recentFolders.filter(
    (recentFolder) => recentFolder !== currentDirQuery.data?.path,
  )

  return (
    <ActionButton
      {...changeFolder}
      alternatives={recentOptions.map((folder) => openRecentFolder(folder))}
      menuButtonProps={{
        label: 'View recent folders',
        disabled: !recentOptions.length,
      }}
      variant="plain"
      status="primary"
      size="md"
      aria-label="Select and open a folder in your system"
      {...propsWithCn(
        buttonProps,
        'font-medium',
        !currentDirQuery.data && 'italic',
      )}
      disabled={currentDirQuery.isFetching || buttonProps.disabled}
    />
  )
}

export { CurrentDirectory }
