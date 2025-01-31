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
  ancestorInfo: AncestorInfo | undefined
}

const GraphBranch = (props: GraphBranchProps) => {
  const { virtualizer, path, branch, baseBranch, ancestorInfo } = props
  const history = useInfiniteQuery(commitHistoryQuery(path, branch))

  const items = virtualizer.getVirtualItems()
  const ancestorNotInRange =
    ancestorInfo &&
    !items.find(
      (virtualRow) => virtualRow.index === ancestorInfo.branchDistance,
    )

  return (
    <>
      {history.data ? (
        items.map((virtualRow) => {
          if (ancestorInfo && virtualRow.index > ancestorInfo.branchDistance) {
            return
          }

          const pageIndex = Math.floor(virtualRow.index / PAGE_SIZE)
          const itemIndex = virtualRow.index % PAGE_SIZE

          const commit: CommitId | undefined =
            history.data.pages[pageIndex]?.[itemIndex]?.hash

          const nextCommit: CommitId | undefined =
            ancestorInfo && commit === ancestorInfo.lastCommit
              ? ancestorInfo.commonCommit
              : (history.data.pages.at(pageIndex)?.at(itemIndex + 1)?.hash ??
                history.data.pages.at(pageIndex + 1)?.at(0)?.hash)

          const nextBranch: BranchName | undefined = nextCommit
            ? ancestorInfo && nextCommit === ancestorInfo.commonCommit
              ? baseBranch
              : branch
            : undefined

          return commit ? (
            <GraphCommit
              key={virtualRow.index}
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
                transform: `translateY(${virtualRow.start}px)`,
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

      {ancestorNotInRange && ancestorInfo.lastCommit && baseBranch && (
        <GraphCommit
          key={ancestorInfo.branchDistance}
          path={path}
          commitId={ancestorInfo.lastCommit}
          elementId={COMMIT_ELEMENT_ID(ancestorInfo.lastCommit, branch)}
          parentId={COMMIT_ELEMENT_ID(ancestorInfo.commonCommit, baseBranch)}
          className={clsx('absolute top-0 left-0')}
          style={{
            transform: `translateY(${(virtualizer.options.gap + virtualizer.options.estimateSize(ancestorInfo.branchDistance)) * ancestorInfo.branchDistance}px)`,
          }}
        />
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
