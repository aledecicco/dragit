import { IconSwitchHorizontal } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useMemo } from 'react'

import type { BranchInfo } from '@api/models'
import { branchesQuery, headInfoQuery } from '@api/queries'
import {
  changeBaseBranch,
  changeBranch,
  useSelectedBranches,
} from '@context/branches'
import { useCurrentDirectory } from '@context/directory'
import { Combobox, type ComboboxOption } from '@lib/Combobox'
import { IconButton } from '@lib/IconButton'

const BranchSelectors = () => {
  const path = useCurrentDirectory()

  const headInfo = useQuery(headInfoQuery(path))
  const branches = useQuery(branchesQuery(path))

  const { branch, baseBranch } = useSelectedBranches()

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
        className={clsx('[&]:w-65')}
        option={branch ? { value: branch.name, data: branch } : undefined}
        options={branchOptions}
        setOption={(newOption) => {
          changeBranch(newOption.data)
        }}
        renderOption={(option) => option.data.name}
        placeholder="Checkout a branch..."
        disabled={headInfo.isLoading || branches.isLoading}
      />

      <IconButton
        Glyph={IconSwitchHorizontal}
        className={clsx('mx-1')}
        variant="neutral"
        aria-label="Switch branch and base branch"
        disabled={!branch || !baseBranch}
        size="md"
        onClick={() => {
          if (baseBranch) {
            changeBranch(baseBranch)
          }
        }}
      />

      <Combobox
        className={clsx('[&]:w-65')}
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
