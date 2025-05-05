import { useQueryCurrentDir } from '@api/queries'
import { useReferencesSync } from '@context/branches'
import { useDialog } from '@context/dialogs'
import { cn } from '@utils/styles'
import { BranchesList } from '@widgets/BranchesList'
import { CurrentDirectory } from '@widgets/CurrentDirectory'
import { CurrentRemote } from '@widgets/CurrentRemote'
import { FileStatuses } from '@widgets/FileStatuses'
import { Graph } from '@widgets/Graph'
import { MainToolbar } from '@widgets/MainToolbar'
import { StashesList } from '@widgets/StashesList'

const App = () => {
  const dialog = useDialog()
  const currentDirQuery = useQueryCurrentDir()

  return (
    <>
      <div
        className={cn(
          'px-8 py-4 w-full h-full max-h-full',
          'grid grid-cols-[1fr_3fr_1fr] grid-rows-[max-content_1fr_max-content] gap-4',
        )}
      >
        <CurrentDirectory
          className={cn('col-start-2 row-start-1', 'justify-self-center')}
        />

        {currentDirQuery.data?.path &&
          currentDirQuery.data.isRepository &&
          currentDirQuery.data.exists && <InRepository />}

        {dialog}
      </div>
    </>
  )
}

const InRepository = () => {
  useReferencesSync()

  return (
    <>
      <StashesList className={cn('col-start-1 row-start-1')} />
      <FileStatuses className={cn('col-start-1 row-start-2')} />
      <MainToolbar className={cn('col-start-1 row-start-3')} />
      <Graph className={cn('col-start-2 row-start-2 row-span-2')} />
      <CurrentRemote className={cn('col-start-3 row-start-1')} />
      <BranchesList className={cn('col-start-3 row-start-2')} />
    </>
  )
}

export { App }
