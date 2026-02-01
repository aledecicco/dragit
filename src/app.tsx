import { enableMapSet } from 'immer'

import { BranchesList } from '@/widgets/BranchesList'
import { CurrentDirectory } from '@/widgets/CurrentDirectory'
import { CurrentRemote } from '@/widgets/CurrentRemote'
import { Graph } from '@/widgets/Graph'
import { MainToolbar } from '@/widgets/MainToolbar'
import { PendingActions } from '@/widgets/PendingActions'
import { StashesList } from '@/widgets/StashesList'
import { StagedWorktreeChanges } from '@/widgets/WorktreeChanges/Staged'
import { UnstagedWorktreeChanges } from '@/widgets/WorktreeChanges/Unstaged'

import { useBackendEventshandler } from '@/api/events'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { useReferencesSync } from '@/state/branches'
import { useDialog } from '@/state/dialogs'
import { useUpstreamSync } from '@/state/upstream'
import { cn } from '@/utils/styles'

import { useDefaultEventPrevention } from './utils/interaction'

enableMapSet()

const App = () => {
  useBackendEventshandler()
  useDefaultEventPrevention()

  const currentDirQuery = useQueryCurrentDir()

  return (
    <>
      <div
        className={cn(
          'px-8 py-4 w-full h-full max-h-full',
          'grid grid-cols-[1fr_2fr_1fr] grid-rows-1 gap-4',
        )}
      >
        {currentDirQuery.data?.path &&
          currentDirQuery.data.isRepository &&
          currentDirQuery.data.exists && <InRepository />}
      </div>

      <Dialogs />
    </>
  )
}

const Dialogs = () => {
  const dialog = useDialog()

  return dialog ? <dialog.DialogComponent {...dialog.props} /> : undefined
}

const InRepository = () => {
  useReferencesSync()
  useUpstreamSync()

  return (
    <>
      <div
        className={cn(
          'grid grid-rows-[min-content_minmax(0,5fr)_max-content] gap-2',
        )}
      >
        <StashesList className={cn('max-h-45')} />

        <div className={cn('grid grid-rows-[auto_auto] gap-4 mb-2')}>
          <UnstagedWorktreeChanges className={cn('h-full min-h-50')} />
          <StagedWorktreeChanges className={cn('h-full min-h-50')} />
        </div>

        <MainToolbar />
      </div>

      <div className={cn('grid grid-rows-[max-content_1fr] gap-4')}>
        <CurrentDirectory className={cn('justify-self-center')} />

        <div className={cn('h-full w-full min-h-0', 'relative')}>
          <Graph />
          <PendingActions
            className={cn('absolute bottom-2 left-half -translate-x-half')}
          />
        </div>
      </div>

      <div className={cn('grid grid-rows-[max-content_1fr] gap-4')}>
        <CurrentRemote />
        <BranchesList />
      </div>
    </>
  )
}

export { App }
