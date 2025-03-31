import { useMemo } from 'react'

import type { BranchInfo, BranchName } from '@api/models'
import { Combobox, type ComboboxOption, type ComboboxProps } from '@ui/Combobox'

interface BranchSelectorProps<T extends boolean>
  extends Partial<
    Omit<
      ComboboxProps<T extends true ? BranchInfo | undefined : BranchInfo>,
      'option' | 'options' | 'setOption'
    >
  > {
  branch: BranchInfo | undefined
  branches: BranchInfo[] | undefined
  exclude?: BranchName
  allowEmpty: T
  onBranchChange: (
    newBranch: ComboboxOption<
      T extends true ? BranchInfo | undefined : BranchInfo
    >,
  ) => void
}

const BranchSelector = <T extends boolean>(props: BranchSelectorProps<T>) => {
  const {
    branch,
    branches,
    exclude,
    allowEmpty,
    onBranchChange,
    ...comboboxProps
  } = props

  const branchOptions: ComboboxOption<
    T extends true ? BranchInfo | undefined : BranchInfo
  >[] = useMemo(() => {
    return getBranchOptions(branches, allowEmpty, exclude)
  }, [branches, allowEmpty, exclude])

  return (
    <Combobox
      option={branch ? { value: branch.name, data: branch } : undefined}
      options={branchOptions}
      setOption={onBranchChange}
      renderOption={(option) => option.data?.name ?? 'No branch'}
      placeholder="Choose a branch..."
      {...comboboxProps}
      disabled={!branches || comboboxProps.disabled}
    />
  )
}

type BranchOptionType<T extends boolean> = T extends true
  ? BranchInfo | undefined
  : BranchInfo

function getBranchOptions<T extends boolean>(
  branches: BranchInfo[] | undefined,
  allowEmpty: T,
  exclude?: BranchName,
): ComboboxOption<BranchOptionType<T>>[] {
  let options: ComboboxOption<BranchOptionType<T>>[] =
    branches?.map((branch) => {
      const option = {
        value: branch.name,
        data: branch,
      }
      return option
    }) ?? []

  if (exclude) {
    options = options.filter((option) => option.value !== exclude)
  }

  if (allowEmpty) {
    options.unshift({ value: '', data: undefined as BranchOptionType<T> })
  }

  return options
}

export { BranchSelector, type BranchSelectorProps }
