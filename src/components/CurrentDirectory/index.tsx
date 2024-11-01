import { useQuery } from '@tanstack/react-query'
import { open } from '@tauri-apps/plugin-dialog'

import { useOpenFolder } from '@api/commands'
import { currentDirQuery } from '@api/queries'

const CurrentDirectory = () => {
  const currentDir = useQuery(currentDirQuery)
  const openFolder = useOpenFolder()

  return (
    <div>
      <p>
        {currentDir.data
          ? `Current directory: ${currentDir.data}`
          : currentDir.isFetching
            ? 'Loading current directory...'
            : 'No directory open'}
      </p>
      <button
        type="button"
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
      </button>
    </div>
  )
}

export { CurrentDirectory }
