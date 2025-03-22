import { useEffect, useRef } from 'react'

import { useOpenFolder } from '@api/commands'
import { useBranchesSync } from '@context/branches'
import { useDialog } from '@context/dialogs'
import { useDirectoryIsOpen, useDirectorySync } from '@context/directory'
import { CurrentDirectory } from '@main/CurrentDirectory'
import { Graph } from '@main/Graph'
import { cn } from '@utils/styles'
import { BranchesList } from '@widgets/BranchesList'
import { FileStatuses } from '@widgets/FileStatuses'
import { MainToolbar } from '@widgets/MainToolbar'

const App = () => {
  useDirectorySync()
  const dialog = useDialog()
  const isOpen = useDirectoryIsOpen()

  const open = useOpenFolder()

  const init = useRef(false)
  useEffect(() => {
    if (!init.current) {
      init.current = true
      open.mutate('/home/adecicco/Projects/test-git')
    }
  }, [open])

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

      {isOpen && <AppInner />}

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
