import { IconRefresh } from '@tabler/icons-react'

import { useFetchRemote } from '@api/mutations'
import { BranchToolbar } from '@common/BranchToolbar'
import { useSelectedBranches } from '@context/branches'
import { IconButton } from '@ui/IconButton'
import { cn } from '@utils/styles'

const BranchToolbars = () => {
  const fetchRemote = useFetchRemote()

  const { branch, baseBranch } = useSelectedBranches()

  return (
    <>
      <BranchToolbar
        branch={branch}
        fixed
        className={cn('col-start-1 row-start-2 w-40')}
      />

      <IconButton
        variant="neutral"
        Glyph={IconRefresh}
        label="Fetch all"
        onClick={() => {
          fetchRemote.mutateAsync({ remote: 'origin' })
        }}
        className={cn('col-start-2 row-start-2 w-20')}
        round={false}
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
