import { BranchesList } from '@/widgets/BranchesList'
import { CurrentDirectory } from '@/widgets/CurrentDirectory'
import { CurrentRemote } from '@/widgets/CurrentRemote'
import { FileStatuses } from '@/widgets/FileStatuses'
import { Graph } from '@/widgets/Graph'
import { MainToolbar } from '@/widgets/MainToolbar'
import { StashesList } from '@/widgets/StashesList'

import { useQueryCurrentDir } from '@/api/queries'
import { useReferencesSync } from '@/context/branches'
import { useDialog } from '@/context/dialogs'
import { useUpstreamSync } from '@/context/upstream'
import { useContextMenuHandler } from '@/lib/ContextMenu'
import { cn } from '@/utils/styles'

const App = () => {
  useContextMenuHandler()
  const currentDirQuery = useQueryCurrentDir()

  return (
    <>
      <div
        className={cn(
          'px-8 py-4 w-full h-full max-h-full',
          'grid grid-cols-[1fr_2fr_1fr] grid-rows-[max-content_1fr_4fr_max-content] gap-4',
        )}
      >
        <CurrentDirectory
          className={cn('col-start-2 row-start-1', 'justify-self-center')}
        />

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
      <StashesList className={cn('col-start-1 row-start-1 row-span-2')} />
      <FileStatuses className={cn('col-start-1 row-start-3')} />
      <MainToolbar className={cn('col-start-1 row-start-4')} />
      <Graph className={cn('col-start-2 row-start-2 row-span-3')} />
      <CurrentRemote className={cn('col-start-3 row-start-1')} />
      <BranchesList className={cn('col-start-3 row-start-2 row-span-2')} />
    </>
  )
}

export { App }
