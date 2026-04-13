import {
  useChangeCurrentFolder,
  useMakeOpenRecentFolder,
} from '@/api/mutations/openFolder'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { ActionButton } from '@/lib/ActionButton'
import { useSettings } from '@/state/settings'
import type { ButtonProps } from '@/ui/Button'
import { chooseDirectory } from '@/utils/behavior'
import { propsWithCn } from '@/utils/styles'

interface CurrentDirectoryProps extends Partial<ButtonProps> {}

/**
 * Main app widget that displays the current directory path and allows the user to open a new one.
 */
const CurrentDirectory = (props: CurrentDirectoryProps) => {
  const { ...buttonProps } = props

  const currentDirQuery = useQueryCurrentDir()
  const changeFolder = useChangeCurrentFolder()
  const makeOpenRecentFolder = useMakeOpenRecentFolder()

  const { recentFolders } = useSettings()
  const recentOptions = recentFolders.filter(
    (recentFolder) => recentFolder !== currentDirQuery.data?.path,
  )

  return (
    <ActionButton
      action={changeFolder}
      argsRequester={async () => {
        const path = await chooseDirectory()

        if (!path) {
          throw new Error('No folder selected')
        }

        return path
      }}
      alternatives={recentOptions.map((recentFolder) => ({
        action: makeOpenRecentFolder(recentFolder),
      }))}
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
