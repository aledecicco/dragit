import { open } from '@tauri-apps/plugin-dialog'

import { useOpenFolder } from '@/api/mutations/openFolder'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { ActionButton } from '@/lib/ActionButton'
import type { ButtonProps } from '@/ui/Button'
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
    <ActionButton
      action={openFolder}
      argsRequester={async () => {
        const path = await open({
          multiple: false,
          directory: true,
        })

        if (!path) {
          throw new Error('No folder selected')
        }

        return path
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
