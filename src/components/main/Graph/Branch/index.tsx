import { PlusIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery } from '@tanstack/react-query'
import clsx from 'clsx'

import type { AncestorInfo, BranchName, CommitId } from '@api/models'
import { PAGE_SIZE, commitHistoryQuery } from '@api/queries'
import { Button } from '@lib/Button'
import type { Virtualizer } from '@tanstack/react-virtual'
import { GraphCommit } from '../Commit'

const COMMIT_ELEMENT_ID = (commitId: CommitId, branch: BranchName) =>
  `commit_${commitId}_${branch}`

interface GraphBranchProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  path: string
  branch: BranchName
  baseBranch: BranchName | undefined
  commonAncestor: AncestorInfo | undefined
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, path, branch, baseBranch, commonAncestor } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  return (
    <>
      {history.data ? (
        virtualizer.getVirtualItems().map((virtualRow) => {
          if (
            commonAncestor &&
            virtualRow?.index > commonAncestor.branchDistance
          ) {
            return
          }

          const pageIndex = Math.floor(virtualRow?.index / PAGE_SIZE)
          const itemIndex = virtualRow?.index % PAGE_SIZE

          const commit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex]
          const nextCommit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex + 1] ??
            history.data.pages[pageIndex + 1]?.[0]
          const nextBranch: BranchName | undefined = nextCommit
            ? commonAncestor && nextCommit === commonAncestor.commit
              ? baseBranch
              : branch
            : undefined

          return commit ? (
            <GraphCommit
              key={virtualRow?.index}
              path={path}
              commitId={commit}
              elementId={COMMIT_ELEMENT_ID(commit, branch)}
              parentId={
                nextCommit && nextBranch
                  ? COMMIT_ELEMENT_ID(nextCommit, nextBranch)
                  : undefined
              }
              className={clsx('absolute top-0 left-0')}
              style={{
                transform: `translateY(${virtualRow?.start}px)`,
              }}
            />
          ) : undefined
        })
      ) : (
        <p>
          {history.isFetching
            ? 'Loading branch history...'
            : 'No commits found'}
        </p>
      )}

      {history.hasNextPage && (
        <Button
          type="button"
          variant="neutral"
          className={clsx('absolute top-full translate-full left-0')}
          rounded
          aria-label="Load more commits for this branch"
          disabled={history.isFetchingNextPage || !history.hasNextPage}
          onClick={() => {
            history.fetchNextPage()
          }}
        >
          <PlusIcon />
        </Button>
      )}
    </>
  )
}

export { GraphBranch, type GraphBranchProps }
