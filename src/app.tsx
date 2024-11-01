import { useQuery } from '@tanstack/react-query'

import { currentDirQuery } from '@api/queries'
import { CurrentDirectory } from 'components/CurrentDirectory'
import { CurrentBranch } from 'components/Graph/CurrentBranch'

const App = () => {
  const currentDir = useQuery(currentDirQuery)

  return (
    <div>
      <CurrentDirectory />
      {currentDir.data && <CurrentBranch path={currentDir.data} />}
    </div>
  )
}

export { App }
