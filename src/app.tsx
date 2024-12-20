import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'

import { currentDirQuery } from '@api/queries'
import { CurrentDirectory } from '@main/CurrentDirectory'
import { FileStatuses } from '@main/FileStatuses'
import { Graph } from '@main/Graph'

const App = () => {
  const currentDir = useQuery(currentDirQuery)

  return (
    <div
      className={clsx(
        'px-8 py-4 w-full h-full max-h-full',
        'grid grid-cols-1 grid-rows-[max-content_1fr] gap-4',
      )}
    >
      <CurrentDirectory className={clsx('justify-self-center')} />
      {currentDir.data && (
        <div className={clsx('grid grid-cols-2 min-h-0 gap-8')}>
          <Graph path={currentDir.data} />
          <FileStatuses
            path={currentDir.data}
            className={clsx('justify-self-end')}
          />
        </div>
      )}
    </div>
  )
}

export { App }
