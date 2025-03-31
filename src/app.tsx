import { useQueryCurrentDir } from '@api/queries'
import { useBranchesSync } from '@context/branches'
import { useDialog } from '@context/dialogs'
import { usePagesSync } from '@context/pages'
import { Graph } from '@main/Graph'
import { cn } from '@utils/styles'
import { BranchesList } from '@widgets/BranchesList'
import { CurrentDirectory } from '@widgets/CurrentDirectory'
import { FileStatuses } from '@widgets/FileStatuses'
import { MainToolbar } from '@widgets/MainToolbar'

const App = () => {
  const dialog = useDialog()
  const currentDirQuery = useQueryCurrentDir()

  return (
    <div
      className={cn(
        'px-8 py-4 w-full h-full max-h-full',
        'grid grid-cols-[max_content_1fr_max-content] grid-rows-[max-content_1fr] gap-4',
      )}
    >
      <CurrentDirectory
        className={cn('col-start-2 row-start-1', 'justify-self-center')}
      />

      {currentDirQuery.data?.path &&
        currentDirQuery.data.isRepository &&
        currentDirQuery.data.exists && <AppInner />}

      {dialog}
    </div>
  )
}

const AppInner = () => {
  useBranchesSync()
  usePagesSync()

  return (
    <>
      <MainToolbar className={cn('col-start-1 row-start-3')} />
      <FileStatuses className={cn('col-start-1 row-start-2')} />
      <Graph className={cn('col-start-2 row-start-2 row-span-2')} />
      <BranchesList className={cn('col-start-3 row-start-2')} />
    </>
  )
}

export { App }
