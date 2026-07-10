import type { ReactNode } from 'react'
import { IconGitBranch, IconGitCommit, IconTag } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type {
  BranchInfo,
  BranchName,
  CommitId,
  Reference,
  TagInfo,
} from '@/api/models'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryMatchingCommits } from '@/api/queries/matchingCommits'
import { useQueryTags } from '@/api/queries/tags'
import { Combobox, type ComboboxProps } from '@/ui/Combobox'
import { useComboboxState } from '@/ui/Combobox/context'
import { ComboboxSection } from '@/ui/Combobox/Section'

interface RefSelectorProps extends Partial<Omit<ComboboxProps, 'value'>> {
  /**
   * The currently selected reference.
   */
  reference: Reference | null | undefined

  /**
   * Branches to ensure are present at the top.
   */
  pinnedBranches?: BranchName[]

  /**
   * Branches to ensure are not present.
   */
  excludedBranches?: BranchName[]

  /**
   * Callback to trigger when a branch is selected.
   */
  onSelectBranch: (value: string, branch: BranchInfo | undefined) => void

  /**
   * Callback to trigger when a tag is selected.
   */
  onSelectTag: (value: string, tag: TagInfo | undefined) => void

  /**
   * Callback to trigger when a commit is selected.
   */
  onSelectCommit: (value: string, commit: CommitId | undefined) => void

  /**
   * Element to display when no branch matches the search.
   */
  noBranchMatches?: (search: string) => ReactNode

  /**
   * Element to display when no tag matches the search.
   */
  noTagMatches?: (search: string) => ReactNode

  /**
   * Element to display when no commit matches the search.
   */
  noCommitMatches?: (search: string) => ReactNode
}

/**
 * A combobox that allows selecting a branch, a tag, or a commit.
 */
const RefSelector = ({
  reference,
  pinnedBranches,
  excludedBranches,
  onSelectBranch,
  onSelectTag,
  onSelectCommit,
  noBranchMatches,
  noTagMatches,
  noCommitMatches,
  ...comboboxProps
}: RefSelectorProps) => {
  const branchesQuery = useQueryBranches()
  const tagsQuery = useQueryTags()

  const value =
    reference?.type === 'commit'
      ? `#${reference.refName}`
      : (reference?.refName ?? '')

  const Glyph = match(reference?.type)
    .with('commit', () => IconGitCommit)
    .with('tag', () => IconTag)
    .otherwise(() => IconGitBranch)

  const branchOptions = [
    ...(pinnedBranches ?? []),
    ...(branchesQuery.data?.map((b) => b.name) ?? []).filter(
      (b) => !pinnedBranches?.includes(b) && !excludedBranches?.includes(b),
    ),
  ]
  const tagOptions = tagsQuery.data?.map((t) => t.name) ?? []

  return (
    <Combobox
      value={value}
      defaultGroup={match(reference)
        .with({ type: 'branch' }, () => 'branches')
        .with({ type: 'tag' }, () => 'tags')
        .with({ type: 'commit' }, () => 'commits')
        .otherwise(() => undefined)}
      {...comboboxProps}
      Glyph={comboboxProps.Glyph ?? Glyph}
    >
      <ComboboxSection
        name="branches"
        onSelect={(value) =>
          onSelectBranch(
            value,
            branchesQuery.data?.find((b) => b.name === value),
          )
        }
        options={branchOptions}
        noMatches={noBranchMatches}
      />
      <ComboboxSection
        name="tags"
        onSelect={(value) =>
          onSelectTag(
            value,
            tagsQuery.data?.find((t) => t.name === value),
          )
        }
        options={tagOptions}
        noMatches={noTagMatches}
      />

      <CommitSection
        onSelectCommit={onSelectCommit}
        noCommitMatches={noCommitMatches}
      />
    </Combobox>
  )
}

const CommitSection = (
  props: Pick<RefSelectorProps, 'onSelectCommit' | 'noCommitMatches'>,
) => {
  const { onSelectCommit, noCommitMatches } = props

  const { search } = useComboboxState()
  const matchingCommitsQuery = useQueryMatchingCommits(search)

  const commitOptions =
    matchingCommitsQuery.data?.map((hash) => `#${hash}`) ?? []

  return (
    <ComboboxSection
      name="commits"
      onSelect={(value) => onSelectCommit(value.slice(1), value.slice(1))}
      options={commitOptions}
      noMatches={noCommitMatches}
    />
  )
}

export { RefSelector, type RefSelectorProps }
