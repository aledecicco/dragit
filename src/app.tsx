import { enableMapSet } from 'immer'

import { InRepositoryPage } from '@/layout/pages/InRepository'
import { StartupPage } from '@/layout/pages/Startup'

import { useBackendEventshandler } from '@/api/events'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { DialogsHandler } from '@/lib/DialogsHandler'
import { ToastsHandler } from '@/lib/Toasts/Handler'
import { cn } from '@/utils/styles'

import { useQueryStorage } from './api/queries/storage'
import { useDefaultEventPrevention } from './utils/behavior'

enableMapSet()

const App = () => {
  useBackendEventshandler()
  useDefaultEventPrevention()

  const storageQuery = useQueryStorage()
  const currentDirQuery = useQueryCurrentDir()

  return (
    <>
      <div
        className={cn(
          'px-8 py-4 size-full max-h-full',
          'grid grid-cols-[1fr_1.95fr_1fr] grid-rows-1 gap-4',
        )}
      >
        {storageQuery.data &&
        currentDirQuery.data?.path &&
        currentDirQuery.data.isRepository &&
        currentDirQuery.data.exists ? (
          <InRepositoryPage />
        ) : (
          <StartupPage />
        )}
      </div>

      <ToastsHandler />
      <DialogsHandler />
    </>
  )
}

export { App }
