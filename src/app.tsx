import { currentDirQuery } from '@api/queries'

import { useBranchesSync } from '@context/branches'
import { useDialog } from '@context/dialogs'
import { Graph } from '@main/Graph'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@utils/styles'
import { BranchesList } from '@widgets/BranchesList'
import { CurrentDirectory } from '@widgets/CurrentDirectory'
import { FileStatuses } from '@widgets/FileStatuses'
import { MainToolbar } from '@widgets/MainToolbar'

const App = () => {
  const dialog = useDialog()
  const currentDir = useQuery(currentDirQuery)

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

      {currentDir.data?.path &&
        currentDir.data.isRepository &&
        currentDir.data.exists && <AppInner />}

      {dialog}
    </div>
  )
}

const AppInner = () => {
  useBranchesSync()

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
