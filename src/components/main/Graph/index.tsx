import { IconSwitchHorizontal } from '@tabler/icons-react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useCheckoutLocalBranch } from '@api/commands'
import type { BranchInfo } from '@api/models'
import {
  branchesQuery,
  commitHistoryQuery,
  commonAncestorQuery,
  headInfoQuery,
} from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { Combobox, type ComboboxOption } from '@lib/Combobox'
import { IconButton } from '@lib/IconButton'
import { SvgOverlay, useSvgOverlay } from '@main/SvgOverlay'
import { GraphAnchor } from './Anchor'
import { GraphBranch } from './Branch'
import { BranchMessage } from './Branch/Message'
import { NODE_SIZE } from './Commit'
import { CURVE_SIZE, EDGE_OFFSET, Edges } from './Edges'
import { useCurrentBranch } from './utils'

interface GraphProps {
  path: string
}

interface ChosenBranches {
  branch: BranchInfo | undefined
  baseBranch: BranchInfo | undefined
}

const Graph = (props: GraphProps) => {
  const { path } = props

  const headInfo = useQuery(headInfoQuery(path))
  const branches = useQuery(branchesQuery(path))
  const currentBranch = useCurrentBranch(path)

  const [{ branch, baseBranch }, setChosenBranches] = useState<ChosenBranches>({
    branch: currentBranch,
    baseBranch: undefined,
  })

  const checkout = useCheckoutLocalBranch()

  useEffect(() => {
    setChosenBranches((oldBranches) => ({
      branch: currentBranch,
      baseBranch:
        oldBranches.baseBranch &&
        oldBranches.baseBranch.name === currentBranch?.name
          ? oldBranches.branch
          : oldBranches.baseBranch,
    }))
  }, [currentBranch])

  const changeBaseBranch = useCallback(
    (newBaseBranch: BranchInfo | undefined) => {
      setChosenBranches((oldBranches) => ({
        ...oldBranches,
        baseBranch: newBaseBranch,
      }))
    },
    [],
  )

  const branchOptions = useMemo(() => {
    const options: ComboboxOption<BranchInfo>[] =
      branches.data?.map((branch) => ({ value: branch.name, data: branch })) ??
      []

    return options
  }, [branches.data])

  const baseBranchOptions = useMemo(() => {
    const options: ComboboxOption<BranchInfo | undefined>[] =
      branchOptions.filter((branch) => branch.value !== currentBranch?.name)
    options.unshift({ value: '', data: undefined })

    return options
  }, [currentBranch, branchOptions])

  return (
    <div className={clsx('h-full w-full min-h-0')}>
      <div
        className={clsx(
          'overflow-hidden w-full h-full relative',
          'grid grid-cols-[1fr_max-content_max-content_1fr] grid-rows-[max-content_1fr]',
          'col-gap-8 place-items-center p-1',
        )}
      >
        <Combobox
          className={clsx('[&]:w-65')}
          option={branch ? { value: branch.name, data: branch } : undefined}
          options={branchOptions}
          setOption={(newOption) => {
            checkout(newOption.data.name)
          }}
          renderOption={(option) => option.data.name}
          placeholder="Checkout a branch..."
          disabled={headInfo.isLoading || branches.isLoading}
        />

        <IconButton
          Glyph={IconSwitchHorizontal}
          className={clsx('col-span-2 mx-1')}
          variant="neutral"
          aria-label="Switch branch and base branch"
          disabled={!branch || !baseBranch}
          size="md"
          onClick={() => {
            if (baseBranch) {
              checkout(baseBranch.name)
            }
          }}
        />

        <Combobox
          className={clsx('[&]:w-65')}
          option={
            baseBranch
              ? { value: baseBranch.name, data: baseBranch }
              : undefined
          }
          options={baseBranchOptions}
          setOption={(newOption) => {
            changeBaseBranch(newOption.data)
          }}
          renderOption={(option) => option.data?.name ?? 'No base branch'}
          placeholder="Choose a base branch..."
          disabled={headInfo.isLoading || branches.isLoading}
        />

        <SvgOverlay className={clsx('col-span-4')} RenderOverlay={Edges}>
          <GraphInner {...props} branch={branch} baseBranch={baseBranch} />
        </SvgOverlay>
      </div>
    </div>
  )
}

interface GraphInnerProps extends GraphProps {
  branch: BranchInfo | undefined
  baseBranch: BranchInfo | undefined
}

const GraphInner = (props: GraphInnerProps) => {
  const { path, branch, baseBranch } = props
  const commonAncestor = useQuery(
    commonAncestorQuery(path, branch?.name, baseBranch?.name),
  )

  const svgOverlay = useSvgOverlay()

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh arrows when branches change
  useEffect(() => {
    svgOverlay.refresh()
  }, [commonAncestor.data, branch, baseBranch])

  const branchHistory = useInfiniteQuery(commitHistoryQuery(path, branch?.name))
  const baseBranchHistory = useInfiniteQuery(
    commitHistoryQuery(path, baseBranch?.name),
  )

  const branchLength = Math.min(
    (commonAncestor.data?.lastCommit?.distance ?? Number.POSITIVE_INFINITY) + 1,
    getPaginatedLength(branchHistory),
  )
  const baseLength = getPaginatedLength(baseBranchHistory)

  const virtualizer = useVirtualizer({
    estimateSize: () => NODE_SIZE,
    gap: CURVE_SIZE * 2 + EDGE_OFFSET * 2,
    paddingEnd: CURVE_SIZE * 3.5,
    getScrollElement: () => svgOverlay.componentRef.current,
    count: Math.max(branchLength, baseLength),
  })

  return (
    <div
      ref={svgOverlay.componentRef}
      className={clsx('overflow-hidden contain-strict w-full h-full')}
    >
      <div
        className={clsx('relative w-full contain-layout')}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {branch ? (
          <GraphBranch
            path={path}
            virtualizer={virtualizer}
            branch={branch}
            anchor={commonAncestor.data?.lastCommit}
            isBase={false}
          />
        ) : (
          <BranchMessage isBase={false}>No branch checked out</BranchMessage>
        )}

        {baseBranch ? (
          <GraphBranch
            path={path}
            virtualizer={virtualizer}
            branch={baseBranch}
            anchor={commonAncestor.data?.commonCommit ?? undefined}
            isBase={true}
          />
        ) : (
          <BranchMessage isBase={true}>No base branch selected</BranchMessage>
        )}

        {branch && baseBranch && commonAncestor.data && (
          <GraphAnchor
            path={path}
            virtualizer={virtualizer}
            branch={branch}
            baseBranch={baseBranch}
            commonAncestorInfo={commonAncestor.data}
          />
        )}
      </div>
    </div>
  )
}

export { Graph, type GraphProps }
