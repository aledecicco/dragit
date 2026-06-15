import { IconGitBranch, IconGitCommit, IconTag } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import { useQueryBranches } from '@/api/queries/branches'
import { useQueryTags } from '@/api/queries/tags'
import { useChangeSelectedBase, useSelectedBase } from '@/state/branches'
import { useSelectedUpstream } from '@/state/upstream'
import { Combobox, type ComboboxProps } from '@/ui/Combobox'
import { ComboboxSection } from '@/ui/Combobox/Section'
import { ensurePresent } from '@/utils/array'
import {
  getUpstreamReference,
  useBranch,
  useHeadReference,
} from '@/utils/repository'
import { propsWithCn } from '@/utils/styles'

interface BaseBranchSelectorProps extends Partial<ComboboxProps> {}

/**
 * The combobox used to select the base branch for the graph.
 */
const BaseBranchSelector = (props: BaseBranchSelectorProps) => {
  const { ...comboboxProps } = props

  const branchesQuery = useQueryBranches()
  const tagsQuery = useQueryTags()

  const currentReference = useHeadReference()
  const currentBranch = useBranch(currentReference)
  const currentUpstream = useSelectedUpstream(currentBranch)
  const baseReference = useSelectedBase(currentReference)
  const changeSelectedBase = useChangeSelectedBase()

  const branchOptions = branchesQuery.data?.map((branch) => branch.name) ?? []
  const baseBranchOptions = [
    '',
    ...(currentUpstream
      ? ensurePresent(
          branchOptions,
          getUpstreamReference(currentUpstream).refName,
          true,
        )
      : branchOptions
    ).filter((branch) => branch !== currentReference?.refName),
  ]
  const tagOptions = tagsQuery.data?.map((tag) => tag.name) ?? []

  return (
    <Combobox
      placeholder="Choose a base branch..."
      Glyph={match(baseReference?.type)
        .with('commit', () => IconGitCommit)
        .with('tag', () => IconTag)
        .otherwise(() => IconGitBranch)}
      {...propsWithCn(comboboxProps, 'w-full border border-dark-50')}
      disabled={!currentReference || comboboxProps.disabled}
      value={
        baseReference?.type === 'commit'
          ? `#${baseReference.refName}`
          : (baseReference?.refName ?? '')
      }
    >
      <ComboboxSection
        name="branches"
        onSelect={(value) => {
          if (currentReference) {
            changeSelectedBase(
              currentReference,
              value
                ? {
                    type: 'branch',
                    refName: value,
                  }
                : null,
            )
          }
        }}
        options={baseBranchOptions}
      />

      <ComboboxSection
        name="tags"
        onSelect={(value) => {
          if (currentReference) {
            changeSelectedBase(currentReference, {
              type: 'tag',
              refName: value,
            })
          }
        }}
        options={tagOptions}
      />
    </Combobox>
  )
}

export { BaseBranchSelector }
