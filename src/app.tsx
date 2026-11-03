import { enableMapSet } from 'immer'

import { InRepositoryPage } from '@/layout/pages/InRepository'
import { StartupPage } from '@/layout/pages/Startup'

import { useBackendEventshandler } from '@/api/events'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { useQueryStorage } from '@/api/queries/storage'
import { DialogsHandler } from '@/lib/DialogsHandler'
import { ToastsHandler } from '@/lib/Toasts/Handler'
import { useIsCompactLayout, useSideColumn } from '@/state/layout'
import { useDefaultEventPrevention } from '@/utils/behavior'
import { cn } from '@/utils/styles'

enableMapSet()

const App = () => {
  useBackendEventshandler()
  useDefaultEventPrevention()

  const storageQuery = useQueryStorage()
  const currentDirQuery = useQueryCurrentDir()

  const isCompact = useIsCompactLayout()
  const sideColumn = useSideColumn()

  const isInRepository =
    !!storageQuery.data &&
    !!currentDirQuery.data?.path &&
    currentDirQuery.data.isRepository &&
    currentDirQuery.data.exists

  return (
    <>
      <div
        className={cn(
          'px-6 py-4 size-full max-h-full',
          'max-md-screen:px-4 max-md-screen:py-2',
          'grid grid-rows-1 gap-4 max-md-screen:gap-2',
          !isInRepository &&
            'grid-cols-[minmax(0,1fr)_minmax(0,1.95fr)_minmax(0,1fr)]',
          isInRepository && [
            !isCompact &&
              'grid-cols-[minmax(240px,1fr)_minmax(800px,1.95fr)_minmax(240px,1fr)]',
            isCompact && [
              sideColumn === 'left' &&
                'pr-4 grid-cols-[minmax(240px,1fr)_minmax(600px,2.2fr)_--spacing(6)]',
              sideColumn === 'right' &&
                'pl-4 grid-cols-[--spacing(6)_minmax(600px,2.2fr)_minmax(240px,0.8fr)]',
            ],
          ],
        )}
      >
        {isInRepository ? <InRepositoryPage /> : <StartupPage />}
      </div>

      <ToastsHandler />
      <DialogsHandler />
    </>
  )
}

export { App }
