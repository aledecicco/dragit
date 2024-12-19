import { type ComponentType, type JSX, useEffect, useRef } from 'react'

import type { BranchName, CommitId } from '@api/models'
import { type ElementId, useSvgOverlay } from './context'

export const ELEMENT_ID = (commitId: CommitId, branch: BranchName): ElementId =>
  `commit_${branch}_${commitId}`

interface TrackedComponentProps {
  commitId: CommitId
  branch: BranchName
  parentCommitId: CommitId | undefined
  parentBranch: BranchName | undefined
}

const makeTracked = <P,>(WrappedComponent: ComponentType<P>) => {
  const TrackedComponent = (
    props: P & JSX.IntrinsicAttributes & TrackedComponentProps,
  ) => {
    const { commitId, branch, parentCommitId, parentBranch } = props
    const svgOverlay = useSvgOverlay()

    const ref = useRef<HTMLElement>(null)
    const id = ELEMENT_ID(commitId, branch)
    const parent =
      parentCommitId && parentBranch
        ? ELEMENT_ID(parentCommitId, parentBranch)
        : undefined

    useEffect(() => {
      svgOverlay.registerElement(id, {
        ref,
        commitId,
        branch,
        parent,
      })

      return () => {
        svgOverlay.unregisterElement(id)
      }
    }, [
      id,
      commitId,
      branch,
      parent,
      svgOverlay.registerElement,
      svgOverlay.unregisterElement,
    ])

    return <WrappedComponent {...props} ref={ref} />
  }

  return TrackedComponent
}

export { makeTracked }
