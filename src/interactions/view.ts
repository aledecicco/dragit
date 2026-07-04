import { IconEye, IconGitCompare } from '@tabler/icons-react'

import type {
  BranchInfo,
  CommitInfo,
  Reference,
  StashInfo,
  TagInfo,
  WorktreeFileInfo,
} from '@/api/models'
import { showCommitSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog/Commit'
import { showComparisonSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog/Comparison'
import { showStashSnapshotDetailsDialog } from '@/common/SnapshotDetailsDialog/Stash'
import { changeSelectedFile } from '@/state/file'

export const compareSomeReferenceInteraction = (
  reference: Reference,
  against?: Reference,
) => ({
  label: against ? 'Compare selected refs' : 'Compare against...',
  Glyph: IconGitCompare,
  onClick: () => {
    showComparisonSnapshotDetailsDialog(reference, against)
  },
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

export const viewCommitInteraction = (commit: CommitInfo) => ({
  label: 'View commit details',
  Glyph: IconEye,
  onClick: () => {
    showCommitSnapshotDetailsDialog(commit)
  },
})

export const viewStashInteraction = (stash: StashInfo) => ({
  label: 'View stash details',
  Glyph: IconEye,
  onClick: () => {
    showStashSnapshotDetailsDialog(stash)
  },
})

export const viewFileInteraction = (file: WorktreeFileInfo) => ({
  label: 'View changes',
  Glyph: IconEye,
  onClick: () => {
    changeSelectedFile(file)
  },
})
