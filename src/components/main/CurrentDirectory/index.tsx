import { useQuery } from '@tanstack/react-query'
import { open } from '@tauri-apps/plugin-dialog'
import { useEffect, useRef } from 'react'

import { useOpenFolder } from '@api/commands'
import { currentDirQuery } from '@api/queries'
import { Button } from '@lib/Button'
import { TextInput } from '@lib/TextInput'

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
    <div>
      <p>
        {currentDir.data
          ? `Current directory: ${currentDir.data}`
          : currentDir.isFetching
            ? 'Loading current directory...'
            : 'No directory open'}
      </p>
      <TextInput placeholder="aaaa" />
      <Button
        type="button"
        variant="primary"
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
        Open folder
      </Button>
    </div>
  )
}

export { CurrentDirectory }
