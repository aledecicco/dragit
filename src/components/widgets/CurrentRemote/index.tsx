import {
  IconWorld,
  IconWorldCancel,
  IconWorldQuestion,
} from '@tabler/icons-react'
import { type ComponentProps, useMemo } from 'react'

import type { RemoteBranch } from '@api/models'
import { useSetUpstream } from '@api/mutations'
import { useQueryBranches } from '@api/queries'
import { useSelectedRefs } from '@context/branches'
import { Combobox, type ComboboxOption } from '@ui/Combobox'
import { useBranch, useTrackedBranch } from '@utils/repository'
import { cn, propsWithCn } from '@utils/styles'

interface CurrentRemoteProps extends ComponentProps<'div'> {}

const CurrentRemote = (props: CurrentRemoteProps) => {
  const { ...divProps } = props

  const { reference } = useSelectedRefs()
  const branch = useBranch(reference)
  const trackedBranch = useTrackedBranch(branch)
  const branchesQuery = useQueryBranches()

  const setUpstream = useSetUpstream()

  const upstreamOptions: ComboboxOption<RemoteBranch>[] = useMemo(() => {
    return (
      branchesQuery.data
        ?.filter((branch) => branch.type === 'remote')
        .map((branch) => {
          const option = {
            value: branch.name,
            data: branch,
          }
          return option
        }) ?? []
    )
  }, [branchesQuery.data])

  return (
    <div {...propsWithCn(divProps, 'w-full')}>
      <Combobox
        className={cn('w-full')}
        option={
          trackedBranch
            ? { value: trackedBranch.name, data: trackedBranch }
            : undefined
        }
        options={upstreamOptions}
        Glyph={
          reference !== undefined && trackedBranch === undefined
            ? reference.type === 'branch'
              ? IconWorldQuestion
              : IconWorldCancel
            : IconWorld
        }
        setOption={(newOption) => {
          if (branch?.type === 'local') {
            setUpstream.mutateAsync({
              branch: branch.name,
              remoteRef: newOption.data.name,
            })
          }
        }}
        renderOption={(option) => option.data?.name ?? 'No remote'}
        placeholder={
          reference?.type === 'branch' ? 'Choose a remote...' : 'Detached'
        }
        disabled={!branchesQuery.data || branch?.type !== 'local'}
        status={
          reference !== undefined && trackedBranch === undefined
            ? reference.type === 'branch'
              ? 'neutral'
              : 'error'
            : 'success'
        }
      />
    </div>
  )
}

export { CurrentRemote, type CurrentRemoteProps }
