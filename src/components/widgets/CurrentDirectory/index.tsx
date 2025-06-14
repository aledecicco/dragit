import { open } from '@tauri-apps/plugin-dialog'

import { useOpenFolder } from '@/api/mutations'
import { useQueryCurrentDir } from '@/api/queries'
import { Button, type ButtonProps } from '@/ui/Button'
import { propsWithCn } from '@/utils/styles'

interface CurrentDirectoryProps extends Partial<ButtonProps> {}

/**
 * Main app widget that displays the current directory path and allows the user to open a new one.
 */
const CurrentDirectory = (props: CurrentDirectoryProps) => {
  const { ...buttonProps } = props
  const currentDirQuery = useQueryCurrentDir()
  const openFolder = useOpenFolder()

  return (
    <Button
      variant="plain"
      status="primary"
      size="md"
      aria-label="Select and open a folder in your system"
      {...propsWithCn(
        buttonProps,
        'font-medium',
        !currentDirQuery.data && 'italic',
      )}
      onClick={(e) => {
        buttonProps.onClick?.(e)

        open({
          multiple: false,
          directory: true,
        }).then((path) => {
          if (path) {
            openFolder.mutateAsync({ newPath: path })
          }
        })
      }}
      disabled={
        openFolder.isPending ||
        currentDirQuery.isFetching ||
        buttonProps.disabled
      }
    >
      {currentDirQuery.data?.path ??
        (currentDirQuery.isFetching
          ? 'Loading directory...'
          : 'Choose a directory')}
    </Button>
  )
}

export { CurrentDirectory }
