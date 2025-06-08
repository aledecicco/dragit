import type { BranchInfo, BranchName } from '@api/models'
import { Combobox, type ComboboxOption, type ComboboxProps } from '@ui/Combobox'

interface BranchSelectorProps<T extends boolean>
  extends Partial<
    Omit<
      ComboboxProps<T extends true ? BranchInfo | undefined : BranchInfo>,
      'option' | 'options' | 'setOption'
    >
  > {
  /**
   * The currently selected branch.
   */
  branch: BranchInfo | undefined

  /**
   * The list of available branches.
   */
  branches: BranchInfo[] | undefined

  /**
   * Optionally exclude a specific branch from the options (usually the current branch).
   */
  exclude?: BranchName

  /**
   * Whether to allow seleting an empty option.
   */
  allowEmpty: T

  /**
   * Callback that handles branch selection changes.
   *
   * @param newBranch - The new branch to be selected. If `allowEmpty` is true, this can be undefined.
   */
  onBranchChange: (newBranch: ComboboxOption<BranchOption<T>>) => void
}

type BranchOption<T extends boolean> = T extends true
  ? BranchInfo | undefined
  : BranchInfo

/**
 * A combobox used for branch selection.
 */
const BranchSelector = <T extends boolean>(props: BranchSelectorProps<T>) => {
  const {
    branch,
    branches,
    exclude,
    allowEmpty,
    onBranchChange,
    ...comboboxProps
  } = props

  const option = branch ? { value: branch.name, data: branch } : undefined
  const branchOptions = getBranchOptions(branches, allowEmpty, exclude)

  return (
    <Combobox
      option={option}
      options={branchOptions}
      setOption={onBranchChange}
      renderOption={(option) => option.data?.name ?? 'No branch'}
      placeholder="Choose a branch..."
      {...comboboxProps}
      disabled={!branches || comboboxProps.disabled}
    />
  )
}

/**
 * Generates the appropriate options for a branch selector based on the provided config.
 *
 * @param branches The list of all available branches.
 * @param allowEmpty Whether to allow selecting an empty option.
 * @param exclude An optional branch name to exclude from the options.
 *
 * @returns An array of combobox options.
 */
const getBranchOptions = <T extends boolean>(
  branches: BranchInfo[] | undefined,
  allowEmpty: T,
  exclude?: BranchName,
): ComboboxOption<BranchOption<T>>[] => {
  let options: ComboboxOption<BranchOption<T>>[] =
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
    options.unshift({ value: '', data: undefined as BranchOption<T> })
  }

  return options
}

export { BranchSelector, type BranchSelectorProps }
