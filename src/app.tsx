import { enableMapSet } from 'immer'

import { InRepositoryPage } from '@/layout/pages/InRepository'
import { StartupPage } from '@/layout/pages/Startup'

import { useBackendEventshandler } from '@/api/events'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { DialogsHandler } from '@/lib/DialogsHandler'
import { cn } from '@/utils/styles'

import { useQuerySettings } from './api/queries/settings'
import { useDefaultEventPrevention } from './utils/behavior'

enableMapSet()

const App = () => {
  useBackendEventshandler()
  useDefaultEventPrevention()

  const settingsQuery = useQuerySettings()
  const currentDirQuery = useQueryCurrentDir()

  return (
    <>
      <div
        className={cn(
          'px-8 py-4 w-full h-full max-h-full',
          'grid grid-cols-[1fr_1.95fr_1fr] grid-rows-1 gap-4',
        )}
      >
        {settingsQuery.data &&
        currentDirQuery.data?.path &&
        currentDirQuery.data.isRepository &&
        currentDirQuery.data.exists ? (
          <InRepositoryPage />
        ) : (
          <StartupPage />
        )}
      </div>

      <DialogsHandler />
    </>
  )
}

export { App }
