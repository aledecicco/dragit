import type { ComponentProps } from 'react'
import { IconReload } from '@tabler/icons-react'

import logo from '@/assets/logo.png'

import type { CurrentDirInfo } from '@/api/models'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { useQueryStorage } from '@/api/queries/storage'
import { FilePath } from '@/common/File/Path'
import {
  useInitRepositoryInteraction,
  useOpenFolderInteraction,
  useOpenSomeRecentFolderInteraction,
} from '@/interactions/folder'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { QueryLoader } from '@/lib/QueryLoader'
import { Marquee } from '@/ui/Marquee'
import { getErrorMessage } from '@/utils/error'
import { cn, propsWithCn } from '@/utils/styles'

/**
 * Page that is displayed when there's no current directory open,
 * or when the current directory is not a repository.
 */
const StartupPage = () => {
  const currentDirQuery = useQueryCurrentDir()

  return (
    <QueryLoader
      query={currentDirQuery}
      loadingFallback={
        <StartupPageInner className={cn('col-start-2')}>
          <p className={cn('text-lg text-light-950 italic')}>Loading...</p>
        </StartupPageInner>
      }
      errorFallback={(error) => (
        <StartupPageInner className={cn('col-start-2')}>
          <p className={cn('text-lg text-danger-600 mb-2')}>
            {getErrorMessage(error)}
          </p>

          <DecoratedButton
            label="Retry"
            Glyph={IconReload}
            size="lg"
            variant="plain"
            status="danger"
            onClick={() => {
              currentDirQuery.refetch()
            }}
          />
        </StartupPageInner>
      )}
    >
      {(currentDir) => {
        if (!currentDir) {
          return (
            <StartupPageInner className={cn('col-start-2')}>
              <p className={cn('text-lg text-light-950')}>
                No folder currently open.
              </p>

              <OpenFolderButton />
            </StartupPageInner>
          )
        }

        return <InFolder currentDir={currentDir} />
      }}
    </QueryLoader>
  )
}

const InFolder = (props: { currentDir: CurrentDirInfo }) => {
  const { currentDir } = props

  const initRepository = useInitRepositoryInteraction()

  return (
    <StartupPageInner className={cn('col-start-2')}>
      <Marquee className={cn('text-lg text-light-500')}>
        <FilePath
          filepath={currentDir.path}
          separatorProps={{ className: cn('text-primary-300') }}
        />
      </Marquee>

      {currentDir.exists ? (
        !currentDir.isRepository && (
          <p className={cn('text-lg text-light-950')}>
            This folder is not a Git repository. Initialize it to begin.
          </p>
        )
      ) : (
        <p className={cn('text-lg text-light-950')}>
          This folder doesn't exist.
        </p>
      )}

      <div className={cn('flex flex-col gap-2')}>
        {currentDir.exists && !currentDir.isRepository && (
          <ActionButton
            {...initRepository}
            size="lg"
            variant="filled"
            status="primary"
            className="w-full"
          />
        )}

        <OpenFolderButton />
      </div>
    </StartupPageInner>
  )
}

const StartupPageInner = (props: ComponentProps<'div'>) => {
  const { children, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-col gap-6 items-center overflow-hidden',
      )}
    >
      <img
        src={logo}
        alt="Dragit logo"
        className={cn('w-60 mt-[30%] pointer-events-none select-none')}
      />

      {children}
    </div>
  )
}

const OpenFolderButton = () => {
  const openFolder = useOpenFolderInteraction()
  const openRecentFolder = useOpenSomeRecentFolderInteraction()

  const storageQuery = useQueryStorage()

  return (
    <ActionButton
      {...openFolder}
      alternatives={
        storageQuery.data?.recentFolders.map((folder) =>
          openRecentFolder(folder),
        ) || []
      }
      menuButtonProps={{
        label: 'View recent folders',
        disabled: !storageQuery.data?.recentFolders.length,
      }}
      aria-label="Select and open a folder in your system"
      size="lg"
      variant="plain"
      status="neutral"
    />
  )
}

export { StartupPage }
