import { IconFolderOpen } from '@tabler/icons-react'

import { useOpenFolder } from '@/api/mutations/openFolder'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { FilePath } from '@/common/File/Path'
import { ActionButton } from '@/lib/ActionButton'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { chooseDirectory } from '@/utils/interaction'
import { getPathLocation } from '@/utils/string'
import { cn } from '@/utils/styles'

/**
 * Main app widget that is displayed when there's no current directory open,
 * or when the current directory is not a repository.
 */
const StartupScreen = () => {
  const currentDirQuery = useQueryCurrentDir()
  const openFolder = useOpenFolder()

  const location = currentDirQuery.data
    ? getPathLocation(currentDirQuery.data.path)
    : undefined

  return (
    <>
      {location ? (
        <div className={cn('px-4 py-8 flex flex-col items-start')}>
          <div
            className={cn(
              'text-primary-200',
              'grid grid-cols-[max-content_1fr] gap-x-3 items-center min-w-0',
            )}
          >
            <Icon Glyph={IconFolderOpen} size="lg" />

            <Marquee className={cn('text-xl')}>{location.filename}</Marquee>
          </div>

          <Marquee className={cn('text-lg text-light-300')}>
            <FilePath
              filepath={location.filedir}
              separatorProps={{ className: cn('text-light-950 font-bold') }}
            />
          </Marquee>

          <ActionButton
            action={openFolder}
            argsRequester={async () => {
              const path = await chooseDirectory()

              if (!path) {
                throw new Error('No folder selected')
              }

              return path
            }}
            className={cn('-ml-3.5')}
            aria-label="Select and open a folder in your system"
            size="lg"
            variant="plain"
            status="primary"
          />
        </div>
      ) : (
        <div className={cn('px-4 py-8 flex flex-col items-start')}>
          <p className={cn('text-lg text-light-950')}>
            No folder currently open.
          </p>

          <ActionButton
            action={openFolder}
            argsRequester={async () => {
              const path = await chooseDirectory()

              if (!path) {
                throw new Error('No folder selected')
              }

              return path
            }}
            className={cn('-ml-3.5')}
            aria-label="Select and open a folder in your system"
            size="lg"
            variant="plain"
            status="primary"
          />
        </div>
      )}

      <div />
    </>
  )
}

export { StartupScreen }
