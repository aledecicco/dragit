import { useQuery } from '@tanstack/react-query'
import { open } from '@tauri-apps/plugin-dialog'

import { useOpenFolder } from '@api/commands'
import { currentDirQuery } from '@api/queries'
import { Button, type ButtonProps } from '@ui/Button'
import { propsWithCn } from '@utils/styles'

interface CurrentDirectoryProps extends Partial<ButtonProps> {}

const CurrentDirectory = (props: CurrentDirectoryProps) => {
  const { ...buttonProps } = props
  const currentDir = useQuery(currentDirQuery)
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
            openFolder.mutate(path)
          }
        })
      }}
      {...propsWithCn(
        buttonProps,
        'text-primary-300 font-medium text-sm',
        !currentDir.data && 'italic',
      )}
      disabled={
        openFolder.isPending || currentDir.isFetching || buttonProps.disabled
      }
    >
      {currentDir.data ??
        (currentDir.isFetching ? 'Loading directory...' : 'Choose a directory')}
    </Button>
  )
}

export { CurrentDirectory }
