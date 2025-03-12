import { useBranchesSync } from '@context/branches'
import { useDialog } from '@context/dialogs'
import { useDirectoryIsOpen, useDirectorySync } from '@context/directory'
import { CurrentDirectory } from '@main/CurrentDirectory'
import { Graph } from '@main/Graph'
import { cn } from '@utils/styles'
import { BranchesList } from '@widgets/BranchesList'
import { FileStatuses } from '@widgets/FileStatuses'

const App = () => {
  const isOpen = useDirectoryIsOpen()
  const dialog = useDialog()
  useDirectorySync()

  return (
    <div
      className={cn(
        'px-8 py-4 w-full h-full max-h-full',
        'grid grid-cols-1 grid-rows-[max-content_1fr] gap-4',
      )}
    >
      <CurrentDirectory className={cn('justify-self-center')} />
      {isOpen && <AppInner />}

      {dialog}
    </div>
  )
}

const AppInner = () => {
  useBranchesSync()

  return (
    <div
      className={cn(
        'grid grid-cols-[2fr_6fr_2fr] gap-x-4',
        'min-h-0 max-h-full',
      )}
    >
      <FileStatuses />
      <Graph />
      <BranchesList />
    </div>
  )
}

export { App }
