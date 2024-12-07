import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'

import { currentDirQuery } from '@api/queries'
import { CurrentDirectory } from '@main/CurrentDirectory'
import { FileStatuses } from '@main/FileStatuses'
import { Graph } from '@main/Graph'

const App = () => {
  const currentDir = useQuery(currentDirQuery)

  return (
    <div className={clsx('px-8 py-4 flex flex-col items-center gap-4')}>
      <CurrentDirectory />
      {currentDir.data && (
        <div className={clsx('flex flex-row justify-between w-full')}>
          <Graph path={currentDir.data} />
          <FileStatuses path={currentDir.data} />
        </div>
      )}
    </div>
  )
}

export { App }
