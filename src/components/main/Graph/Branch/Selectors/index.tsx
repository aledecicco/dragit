import { IconSwitchHorizontal } from '@tabler/icons-react'
import clsx from 'clsx'
import { useMemo } from 'react'

import { useCheckoutLocalBranch } from '@api/commands'
import type { BranchInfo } from '@api/models'
import { branchesQuery, headInfoQuery } from '@api/queries'
import { useRepositoryQuery } from '@api/utils'
import { changeBaseBranch, useSelectedBranches } from '@context/branches'
import { Combobox, type ComboboxOption } from '@lib/Combobox'
import { IconButton } from '@lib/IconButton'

const BranchSelectors = () => {
  const headInfo = useRepositoryQuery(headInfoQuery)
  const branches = useRepositoryQuery(branchesQuery)

  const { branch, baseBranch } = useSelectedBranches()
  const checkout = useCheckoutLocalBranch()

  const branchOptions = useMemo(() => {
    const options: ComboboxOption<BranchInfo>[] =
      branches.data?.map((option) => ({ value: option.name, data: option })) ??
      []

    return options
  }, [branches.data])

  const baseBranchOptions = useMemo(() => {
    const options: ComboboxOption<BranchInfo | undefined>[] =
      branchOptions.filter((option) => option.value !== branch?.name)
    options.unshift({ value: '', data: undefined })

    return options
  }, [branch, branchOptions])

  return (
    <>
      <Combobox
        className={clsx('[&]:w-65 col-start-1 row-start-1')}
        option={branch ? { value: branch.name, data: branch } : undefined}
        options={branchOptions}
        setOption={(newOption) => {
          checkout.mutate(newOption.data.name)
        }}
        renderOption={(option) => option.data.name}
        placeholder="Checkout a branch..."
        disabled={headInfo.isLoading || branches.isLoading}
      />

      <IconButton
        Glyph={IconSwitchHorizontal}
        label="Switch branch and base branch"
        className={clsx('mx-1 col-start-2 row-start-1')}
        variant="neutral"
        disabled={!branch || !baseBranch}
        size="md"
        onClick={() => {
          if (baseBranch) {
            checkout.mutate(baseBranch.name)
          }
        }}
      />

      <Combobox
        className={clsx('[&]:w-65 col-start-3 row-start-1')}
        option={
          baseBranch ? { value: baseBranch.name, data: baseBranch } : undefined
        }
        options={baseBranchOptions}
        setOption={(newOption) => {
          changeBaseBranch(newOption.data)
        }}
        renderOption={(option) => option.data?.name ?? 'No base branch'}
        placeholder="Choose a base branch..."
        disabled={headInfo.isLoading || branches.isLoading}
      />
    </>
  )
}

export { BranchSelectors }
