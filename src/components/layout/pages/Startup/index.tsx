import type { ComponentProps } from 'react'
import { IconReload } from '@tabler/icons-react'

import logo from '@/assets/logo.jpg'

import type { CurrentDirInfo } from '@/api/models'
import { useInitRepository } from '@/api/mutations/initRepository'
import {
  useMakeOpenRecentFolder,
  useOpenFolder,
} from '@/api/mutations/openFolder'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { FilePath } from '@/common/File/Path'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { QueryLoader } from '@/lib/Loader/Query'
import { useSettings } from '@/state/settings'
import { Marquee } from '@/ui/Marquee'
import { chooseDirectory } from '@/utils/behavior'
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

  const initRepository = useInitRepository()

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
            action={initRepository}
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
        className={cn('w-80 mt-[20%] pointer-events-none select-none')}
      />

      {children}
    </div>
  )
}

const OpenFolderButton = () => {
  const openFolder = useOpenFolder()

  const { recentFolders } = useSettings()
  const makeOpenRecentFolder = useMakeOpenRecentFolder()

  return (
    <ActionButton
      action={openFolder}
      argsRequester={async () => {
        const path = await chooseDirectory()

        if (!path) {
          throw new Error('No folder selected')
        }

        return path
      }}
      alternatives={recentFolders.map((recentFolder) => ({
        action: makeOpenRecentFolder(recentFolder),
      }))}
      menuButtonProps={{
        label: 'View recent folders',
        disabled: !recentFolders.length,
      }}
      aria-label="Select and open a folder in your system"
      size="lg"
      variant="plain"
      status="neutral"
    />
  )
}

export { StartupPage }
