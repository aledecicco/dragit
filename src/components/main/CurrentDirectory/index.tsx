import { useQuery } from '@tanstack/react-query'
import { open } from '@tauri-apps/plugin-dialog'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import { useOpenFolder } from '@api/commands'
import { currentDirQuery } from '@api/queries'
import { Button } from '@lib/Button'

const CurrentDirectory = () => {
  const currentDir = useQuery(currentDirQuery)
  const openFolder = useOpenFolder()

  const a = useRef(false)
  useEffect(() => {
    if (!a.current) {
      a.current = true
      openFolder('/home/adecicco/Projects/test-git')
    }
  }, [openFolder])

  return (
    <Button
      type="button"
      variant="plain"
      className={clsx(
        '[&]:text-primary-900 [&]:dark:text-primary-300 [&]:font-medium [&]:text-sm',
        !currentDir.data && '[&]:italic',
      )}
      aria-label="Select and open a folder in your system"
      onClick={() => {
        open({
          multiple: false,
          directory: true,
        }).then((path) => {
          if (path) {
            openFolder(path)
          }
        })
      }}
    >
      {currentDir.data ??
        (currentDir.isFetching ? 'Loading directory...' : 'Choose a directory')}
    </Button>
  )
}

export { CurrentDirectory }
