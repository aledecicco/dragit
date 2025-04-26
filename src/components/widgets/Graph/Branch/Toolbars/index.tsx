import { IconRefresh } from '@tabler/icons-react'
import { useMemo } from 'react'

import { useFetchRemote } from '@api/mutations'
import { BranchToolbar } from '@common/BranchToolbar'
import { ActionButton } from '@lib/ActionButton'
import { useSelectedBranches } from '@utils/repository'
import { cn } from '@utils/styles'

const BranchToolbars = () => {
  const fetchRemote = useFetchRemote()

  const { branch, baseBranch } = useSelectedBranches()
  const fetchAction = useMemo(() => {
    return {
      run: () => {
        return fetchRemote.mutateAsync({ remote: 'origin' })
      },
      Glyph: IconRefresh,
      label: {
        idle: 'Fetch All',
        running: 'Fetching',
        success: 'Fetched',
        error: 'Failed',
      },
    }
  }, [fetchRemote.mutateAsync])

  return (
    <>
      <BranchToolbar
        branch={branch}
        fixed
        className={cn('col-start-1 row-start-2 w-40')}
      />

      <ActionButton
        variant="filled"
        status="neutral"
        mainAction={fetchAction}
        className={cn('col-start-2 row-start-2 w-20')}
        round={false}
        compact
      />

      <BranchToolbar
        branch={baseBranch}
        fixed
        className={cn('col-start-3 row-start-2 w-40')}
      />
    </>
  )
}

export { BranchToolbars }
