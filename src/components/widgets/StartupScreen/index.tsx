import { IconFolderOpen, IconReload } from '@tabler/icons-react'

import logo from '@/assets/logo.jpg'

import type { CurrentDirInfo } from '@/api/models'
import { useInitRepository } from '@/api/mutations/initRepository'
import { useOpenFolder } from '@/api/mutations/openFolder'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { FilePath } from '@/common/File/Path'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { QueryLoader } from '@/lib/Loader/Query'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { getErrorMessage } from '@/utils/error'
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

  return (
    <QueryLoader
      query={currentDirQuery}
      loadingFallback={
        <div className={cn('flex flex-col items-center', 'col-start-2')}>
          <img
            src={logo}
            alt="Dragit logo"
            className={cn('w-80 mt-[20%] pointer-events-none select-none')}
          />

          <p className={cn('text-lg text-light-950 italic')}>Loading...</p>
        </div>
      }
      errorFallback={(error) => (
        <div className={cn('flex flex-col items-center', 'col-start-2')}>
          <img
            src={logo}
            alt="Dragit logo"
            className={cn('w-80 mt-[20%] pointer-events-none select-none')}
          />

          <p className={cn('text-lg text-danger-600 mb-2')}>
            {getErrorMessage(error)}
          </p>

          <DecoratedButton
            label="Retry"
            Glyph={IconReload}
            size="lg"
            variant="plain"
            status="danger"
            onClick={() => currentDirQuery.refetch()}
          />
        </div>
      )}
    >
      {(currentDir) => {
        if (!currentDir) {
          return (
            <>
              <div className={cn('px-4 py-8')}>
                <p className={cn('text-lg text-light-950')}>
                  No folder currently open.
                </p>
              </div>

              <div className={cn('flex flex-col gap-6 items-center')}>
                <img
                  src={logo}
                  alt="Dragit logo"
                  className={cn(
                    'w-80 mt-[20%] pointer-events-none select-none',
                  )}
                />

                <ActionButton
                  action={openFolder}
                  argsRequester={async () => {
                    const path = await chooseDirectory()

                    if (!path) {
                      throw new Error('No folder selected')
                    }

                    return path
                  }}
                  aria-label="Select and open a folder in your system"
                  size="lg"
                  variant="plain"
                  status="neutral"
                />
              </div>
            </>
          )
        }

        return <InFolder currentDir={currentDir} />
      }}
    </QueryLoader>
  )
}

const InFolder = (props: { currentDir: CurrentDirInfo }) => {
  const { currentDir } = props

  const initRepository = useInitRepository()
  const location = getPathLocation(currentDir.path)

  const openFolder = useOpenFolder()

  return (
    <>
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

        <Marquee className={cn('text-lg text-light-800')}>
          <FilePath
            filepath={location.filedir}
            separatorProps={{
              className: cn('text-light-500'),
            }}
          />
        </Marquee>
      </div>

      {currentDir.exists ? (
        !currentDir.isRepository && (
          <div className={cn('flex flex-col gap-6 items-center')}>
            <img
              src={logo}
              alt="Dragit logo"
              className={cn('w-80 mt-[20%] pointer-events-none select-none')}
            />

            <p className={cn('text-lg text-light-950')}>
              This folder is not a Git repository. Initialize it to begin.
            </p>

            <div className={cn('flex flex-col gap-2')}>
              <ActionButton
                action={initRepository}
                size="lg"
                variant="filled"
                status="primary"
                className="w-full"
              />

              <ActionButton
                action={openFolder}
                argsRequester={async () => {
                  const path = await chooseDirectory()

                  if (!path) {
                    throw new Error('No folder selected')
                  }

                  return path
                }}
                aria-label="Select and open a folder in your system"
                size="lg"
                variant="filled"
                status="neutral"
              />
            </div>
          </div>
        )
      ) : (
        <div className={cn('flex flex-col gap-6 items-center')}>
          <img
            src={logo}
            alt="Dragit logo"
            className={cn('w-80 mt-[20%] pointer-events-none select-none')}
          />

          <p className={cn('text-lg text-light-950')}>
            This folder doesn't exist.
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
            aria-label="Select and open a folder in your system"
            size="lg"
            variant="filled"
            status="neutral"
          />
        </div>
      )}
    </>
  )
}

export { StartupScreen }
