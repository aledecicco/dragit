import { BranchesList } from '@/widgets/BranchesList'
import { CurrentDirectory } from '@/widgets/CurrentDirectory'
import { CurrentRemote } from '@/widgets/CurrentRemote'
import { Graph } from '@/widgets/Graph'
import { MainToolbar } from '@/widgets/MainToolbar'
import { StashesList } from '@/widgets/StashesList'
import { StagedWorktreeChanges } from '@/widgets/WorktreeChanges/Staged'
import { UnstagedWorktreeChanges } from '@/widgets/WorktreeChanges/Unstaged'

import { useEventsHandler } from '@/api/events'
import { useQueryCurrentDir } from '@/api/queries/currentDir'
import { useReferencesSync } from '@/context/branches'
import { useDialog } from '@/context/dialogs'
import { useUpstreamSync } from '@/context/upstream'
import { useContextMenuHandler } from '@/lib/ContextMenu/utils'
import { cn } from '@/utils/styles'

const App = () => {
  useEventsHandler()
  useContextMenuHandler()

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

  return dialog
}

const InRepository = () => {
  useReferencesSync()
  useUpstreamSync()

  return (
    <>
      <div
        className={cn('grid grid-rows-[1fr_minmax(0,4fr)_max-content] gap-4')}
      >
        <StashesList className={cn('min-h-30')} />

        <div className={cn('grid grid-rows-[auto_auto] gap-4')}>
          <UnstagedWorktreeChanges className={cn('h-full min-h-50')} />
          <StagedWorktreeChanges className={cn('h-full min-h-50')} />
        </div>

        <MainToolbar />
      </div>

      <div className={cn('grid grid-rows-[max-content_1fr] gap-4')}>
        <CurrentDirectory className={cn('justify-self-center')} />
        <Graph />
      </div>

      <div className={cn('grid grid-rows-[max-content_1fr] gap-4')}>
        <CurrentRemote />
        <BranchesList />
      </div>
    </>
  )
}

export { App }
