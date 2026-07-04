import { IconGitCompare } from '@tabler/icons-react'

import type { BranchInfo, CommitInfo, Reference, TagInfo } from '@/api/models'
import { showComparisonSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog/Comparison'

export const compareSomeReferenceInteraction = (
  reference: Reference,
  against?: Reference,
) => ({
  onClick: async () => {
    showComparisonSnapshotDetailsDialog(reference, against)
  },
  Glyph: IconGitCompare,
  label: against ? 'Compare selected refs' : 'Compare against...',
})

export const compareBranchInteraction = (branch: BranchInfo) =>
  compareSomeReferenceInteraction({
    type: 'branch',
    refName: branch.name,
  })

export const compareTagInteraction = (tag: TagInfo) =>
  compareSomeReferenceInteraction({ type: 'tag', refName: tag.name })

export const compareCommitInteraction = (commit: CommitInfo) =>
  compareSomeReferenceInteraction({
    type: 'commit',
    refName: commit.shortHash,
  })

export const compareTwoInteraction = (
  reference: Reference,
  against: Reference,
) => compareSomeReferenceInteraction(reference, against)
