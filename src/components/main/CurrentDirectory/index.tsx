import { useQuery } from '@tanstack/react-query'
import { open } from '@tauri-apps/plugin-dialog'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import { useOpenFolder } from '@api/commands'
import { currentDirQuery } from '@api/queries'
import { Button, type ButtonProps } from '@lib/Button'

interface CurrentDirectoryProps extends Partial<ButtonProps> {}

const CurrentDirectory = (props: CurrentDirectoryProps) => {
  const { ...buttonProps } = props
  const currentDir = useQuery(currentDirQuery)
  const openFolder = useOpenFolder()

  const a = useRef(false)
  useEffect(() => {
    if (!a.current) {
      a.current = true
      openFolder.mutate('/home/adecicco/Projects/test-git')
    }
  }, [openFolder.mutate])

  return (
    <Button
      variant="plain"
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
      {...buttonProps}
      className={clsx(
        '[&]:text-primary-300 [&]:font-medium [&]:text-sm',
        !currentDir.data && '[&]:italic',
        buttonProps.className,
      )}
    >
      {currentDir.data ??
        (currentDir.isFetching ? 'Loading directory...' : 'Choose a directory')}
    </Button>
  )
}

export { CurrentDirectory }
