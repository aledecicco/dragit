import { RefSelector } from '@/common/RefSelector'
import { useChangeSelectedBase, useSelectedBase } from '@/state/branches'
import { useSelectedUpstream } from '@/state/upstream'
import type { ComboboxProps } from '@/ui/Combobox'
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

  const currentReference = useHeadReference()
  const currentBranch = useBranch(currentReference)
  const currentUpstream = useSelectedUpstream(currentBranch)
  const baseReference = useSelectedBase(currentReference)
  const changeSelectedBase = useChangeSelectedBase()

  return (
    <RefSelector
      placeholder="Choose a base branch..."
      {...propsWithCn(comboboxProps, 'w-full border border-dark-50')}
      disabled={!currentReference || comboboxProps.disabled}
      reference={baseReference}
      pinnedBranches={
        currentUpstream
          ? ['', getUpstreamReference(currentUpstream).refName]
          : ['']
      }
      excludedBranches={
        currentReference ? [currentReference.refName] : undefined
      }
      onSelectBranch={(value) => {
        if (currentReference) {
          changeSelectedBase(
            currentReference,
            value ? { type: 'branch', refName: value } : null,
          )
        }
      }}
      onSelectTag={(value) => {
        if (currentReference) {
          changeSelectedBase(currentReference, { type: 'tag', refName: value })
        }
      }}
    />
  )
}

export { BaseBranchSelector, type BaseBranchSelectorProps }
