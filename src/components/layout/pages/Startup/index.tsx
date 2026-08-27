import type { ComponentProps } from 'react'
import { IconReload } from '@tabler/icons-react'

import logo from '@/assets/logo.png'

import type { CurrentDirInfo } from '@/api/models'
import { useOpenRecentFolder } from '@/api/mutations/openFolder'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { useQueryStorage } from '@/api/queries/storage'
import { FilePath } from '@/common/File/Path'
import {
  useOpenFolderInteraction,
  useOpenSomeRecentFolderInteraction,
} from '@/interactions/folder'
import {
  useCloneRepositoryInteraction,
  useInitRepositoryInteraction,
} from '@/interactions/repository'
import { ActionButton } from '@/lib/ActionButton'
import { interaction } from '@/lib/ActionButton/utils'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { QueryLoader } from '@/lib/QueryLoader'
import { Marquee } from '@/ui/Marquee'
import { getErrorMessage } from '@/utils/error'
import { getPathLocation } from '@/utils/string'
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
          <p className={cn('text-sm text-light-950 italic')}>Loading...</p>
        </StartupPageInner>
      }
      errorFallback={(error) => (
        <StartupPageInner className={cn('col-start-2')}>
          <p className={cn('text-sm text-danger-300 text-center text-balance')}>
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
              <p className={cn('text-sm text-light-950')}>
                Open a folder to get started.
              </p>

              <OpenFolderButton withRecentsMenu={false} />

              <RecentFolders />
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
  const cloneRepository = useCloneRepositoryInteraction()

  const { filedir, filename } = getPathLocation(currentDir.path)

  const canInit = currentDir.exists && !currentDir.isRepository

  return (
    <StartupPageInner className={cn('col-start-2')}>
      <div className={cn('max-w-full flex flex-col items-center gap-0.5 mb-4')}>
        <Marquee className={cn('max-w-full text-lg text-light-50')}>
          {filename}
        </Marquee>

        <Marquee className={cn('max-w-full text-md text-light-950')}>
          <FilePath
            filepath={filedir}
            separatorProps={{ className: cn('text-primary-300/70') }}
          />
        </Marquee>
      </div>

      <p className={cn('text-sm text-light-950 text-center text-balance')}>
        {currentDir.exists
          ? !currentDir.isRepository && 'This folder is not a Git repository.'
          : "This folder doesn't exist."}
      </p>

      <div className={cn('w-full flex flex-col gap-2')}>
        {canInit && (
          <>
            <ActionButton
              {...initRepository}
              size="lg"
              variant="filled"
              status="primary"
              className="w-full"
            />
            <ActionButton
              {...cloneRepository}
              size="lg"
              variant="filled"
              status="neutral"
              className="w-full"
            />
          </>
        )}

        <OpenFolderButton emphasized={!canInit} />
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
        'h-full overflow-hidden',
        'flex flex-col justify-center items-center',
        'animate-enter-fade-in',
      )}
    >
      <div className={cn('flex flex-col items-center gap-1')}>
        <img
          src={logo}
          alt="Dragit logo"
          className={cn('w-40 pointer-events-none select-none')}
        />

        <h1
          className={cn('text-2xl font-semibold tracking-wider text-light-50')}
        >
          Dragit
        </h1>
      </div>

      <div
        className={cn(
          'mt-10 w-full max-w-sm min-h-0 flex flex-col gap-4 items-center',
          'overflow-hidden',
        )}
      >
        {children}
      </div>
    </div>
  )
}

const RecentFolders = () => {
  const storageQuery = useQueryStorage()
  const recentFolders = storageQuery.data?.recentFolders ?? []

  if (!recentFolders.length) {
    return undefined
  }

  return (
    <div className={cn('w-full min-h-0 flex flex-col')}>
      <p
        className={cn(
          'px-2.5 pb-1 text-2xs font-semibold uppercase tracking-widest',
          'text-light-950/60',
        )}
      >
        Recent
      </p>

      <div
        className={cn(
          'min-h-0 max-h-48 flex flex-col gap-1 p-0.5 overflow-y-auto',
        )}
      >
        {recentFolders.map((folder) => (
          <RecentFolderButton key={folder} folder={folder} />
        ))}
      </div>
    </div>
  )
}

const RecentFolderButton = (props: { folder: string }) => {
  const { folder } = props

  const { filedir, filename } = getPathLocation(folder)

  const openFolder = useOpenRecentFolder(folder)
  const namedInteraction = interaction({
    action: { ...openFolder, label: { ...openFolder.label, idle: filename } },
    details: `open "${folder}"`,
  })

  return (
    <ActionButton
      {...namedInteraction}
      className={cn('w-full justify-start')}
      size="md"
      variant="plain"
      status="neutral"
      aria-label={`Open "${folder}"`}
    >
      <span
        className={cn(
          'min-w-0 ml-4 flex-1 text-right text-xs font-normal truncate',
          'text-light-950/60 group-hover:text-light-950',
          'transition-colors duration-200 ease-in-out',
        )}
      >
        {filedir}
      </span>
    </ActionButton>
  )
}

const OpenFolderButton = (props: {
  withRecentsMenu?: boolean
  emphasized?: boolean
}) => {
  const { withRecentsMenu = true, emphasized = true } = props

  const openFolder = useOpenFolderInteraction()
  const openRecentFolder = useOpenSomeRecentFolderInteraction()

  const storageQuery = useQueryStorage()
  const recentFolders = storageQuery.data?.recentFolders ?? []

  return (
    <ActionButton
      {...openFolder}
      className={cn('w-full')}
      alternatives={
        withRecentsMenu
          ? recentFolders.map((folder) => openRecentFolder(folder))
          : undefined
      }
      menuButtonProps={{
        label: 'View recent folders',
        disabled: !recentFolders.length,
      }}
      aria-label="Select and open a folder in your system"
      size="lg"
      variant={emphasized ? 'filled' : 'plain'}
      status={emphasized ? 'primary' : 'neutral'}
    />
  )
}

export { StartupPage }
