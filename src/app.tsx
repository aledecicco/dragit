import clsx from 'clsx'

import { useBranchesSync } from '@context/branches'
import { useDirectoryIsOpen, useDirectorySync } from '@context/directory'
import { CurrentDirectory } from '@main/CurrentDirectory'
import { Graph } from '@main/Graph'
import { FileStatuses } from '@widgets/FileStatuses'

const App = () => {
  const isOpen = useDirectoryIsOpen()
  useDirectorySync()

  return (
    <div
      className={clsx(
        'px-8 py-4 w-full h-full max-h-full',
        'grid grid-cols-1 grid-rows-[max-content_1fr] gap-4',
      )}
    >
      <CurrentDirectory className={clsx('justify-self-center')} />
      {isOpen && <AppInner />}
    </div>
  )
}

const AppInner = () => {
  useBranchesSync()

  return (
    <div className={clsx('grid grid-cols-[2fr_6fr] min-h-0 gap-8')}>
      <FileStatuses
        className={clsx('justify-self-start min-w-0 overflow-hidden w-full')}
      />
      <Graph />
    </div>
  )
}

export { App }
