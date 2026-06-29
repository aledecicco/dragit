import { IconGitCompare } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { BranchInfo, CommitInfo, Reference, TagInfo } from '@/api/models'
import { showComparisonSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog/Comparison'
import { interaction } from '@/lib/ActionButton/utils'

export const useCompareSomeReferenceInteraction = () => {
  return (reference: Reference, against?: Reference) =>
    interaction({
      action: {
        id: {
          key: 'view',
          operation: 'compare',
          reference: reference.refName,
          ...(!!against && { against: against.refName }),
        },
        run: async () => {
          showComparisonSnapshotDetailsDialog(reference, against)
        },
        Glyph: IconGitCompare,
        label: {
          idle: against ? 'Compare' : 'Compare...',
          running: 'Opening comparison',
          success: 'Comparison open',
          error: 'Failed to compare',
        },
      },
      details:
        match(reference)
          .with(
            { type: 'branch' },
            (branch) => `compare branch "${branch.refName}"`,
          )
          .with({ type: 'tag' }, (tag) => `compare tag "${tag.refName}"`)
          .with(
            { type: 'commit' },
            (commit) => `compare commit #${commit.refName}`,
          )
          .exhaustive() +
        match(against)
          .with(
            { type: 'branch' },
            (branch) => ` against branch "${branch.refName}"`,
          )
          .with({ type: 'tag' }, (tag) => ` against tag "${tag.refName}"`)
          .with(
            { type: 'commit' },
            (commit) => ` against commit #${commit.refName}`,
          )
          .with(undefined, () => undefined)
          .exhaustive(),
    })
}

export const useCompareBranchInteraction = (branch: BranchInfo) => {
  const compareSome = useCompareSomeReferenceInteraction()
  return compareSome({ type: 'branch', refName: branch.name })
}

export const useCompareTagInteraction = (tag: TagInfo) => {
  const compareSome = useCompareSomeReferenceInteraction()
  return compareSome({ type: 'tag', refName: tag.name })
}

export const useCompareCommitInteraction = (commit: CommitInfo) => {
  const compareSome = useCompareSomeReferenceInteraction()
  return compareSome({ type: 'commit', refName: commit.shortHash })
}

export const useCompareTwoInteraction = () => {
  const compareSome = useCompareSomeReferenceInteraction()
  return (reference: Reference, against: Reference) =>
    compareSome(reference, against)
}
