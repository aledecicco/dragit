import { open } from '@tauri-apps/plugin-dialog'

import { useOpenFolder } from '@api/mutations'
import { useQueryCurrentDir } from '@api/queries'
import { Button, type ButtonProps } from '@ui/Button'
import { propsWithCn } from '@utils/styles'

interface CurrentDirectoryProps extends Partial<ButtonProps> {}

const CurrentDirectory = (props: CurrentDirectoryProps) => {
  const { ...buttonProps } = props
  const currentDirQuery = useQueryCurrentDir()
  const openFolder = useOpenFolder()

  return (
    <Button
      variant="plain"
      size="sm"
      aria-label="Select and open a folder in your system"
      onClick={() => {
        open({
          multiple: false,
          directory: true,
        }).then((path) => {
          if (path) {
            openFolder.mutate({ newPath: path })
          }
        })
      }}
      {...propsWithCn(
        buttonProps,
        'text-primary-300 font-medium text-sm',
        !currentDirQuery.data && 'italic',
      )}
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
