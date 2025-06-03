import {
  IconMenuDeep,
  IconRefresh,
  IconWorld,
  IconWorldCancel,
  IconWorldQuestion,
} from '@tabler/icons-react'
import { type ComponentProps, useMemo } from 'react'

import type { RemoteInfo } from '@api/models'
import { useFetchRemote } from '@api/mutations'
import { useQueryBranches, useQueryRemotes } from '@api/queries'
import { showRemotesDialog } from '@common/RemotesDialog'
import {
  changeUpstreamBranch,
  changeUpstreamRemote,
  useSelectedUpstream,
} from '@context/upstream'
import { ActionButton } from '@lib/ActionButton'
import { Button } from '@ui/Button'
import { Combobox, type ComboboxOption } from '@ui/Combobox'
import { EditableText } from '@ui/EditableText'
import { Icon } from '@ui/Icon'
import { useSelectedBranches } from '@utils/repository'
import { cn, propsWithCn } from '@utils/styles'

interface CurrentRemoteProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the current remote and remote branch selected for pushing and pulling.
 */
const CurrentRemote = (props: CurrentRemoteProps) => {
  const { ...divProps } = props

  const { branch } = useSelectedBranches()
  const { remote, remoteBranch } = useSelectedUpstream()

  const fetchRemote = useFetchRemote()
  const remotesQuery = useQueryRemotes()
  const branchesQuery = useQueryBranches()

  const remoteOptions: ComboboxOption<RemoteInfo>[] = useMemo(() => {
    return (
      remotesQuery.data?.map((remote) => {
        const option = {
          value: remote.name,
          data: remote,
        }
        return option
      }) ?? []
    )
  }, [remotesQuery.data])

  const remoteBranchOptions = useMemo(() => {
    if (!remote) {
      return []
    }

    return (
      branchesQuery.data
        ?.filter((branch) => branch.type === 'remote')
        .filter((branch) => branch.name.startsWith(`${remote.name}/`))
        .map((branch) => branch.name.substring(remote.name.length + 1)) ?? []
    )
  }, [remote, branchesQuery.data])

  return (
    <div {...propsWithCn(divProps, 'w-full flex flex-row items-center')}>
      <Combobox
        option={remote ? { value: remote.name, data: remote } : undefined}
        options={remoteOptions}
        Glyph={
          branch?.type === 'local'
            ? remote === undefined
              ? IconWorldQuestion
              : IconWorld
            : IconWorldCancel
        }
        setOption={(newOption) => {
          changeUpstreamRemote(newOption.data)
        }}
        renderOption={(option) => option.data?.name ?? 'No remote'}
        placeholder={branch?.type === 'local' ? 'Remote...' : '-'}
        disabled={!remotesQuery.data || branch?.type !== 'local'}
        status={
          branch?.type === 'local'
            ? remote === undefined
              ? 'error'
              : 'primary'
            : 'neutral'
        }
        className={cn('max-w-half -mr-[2px] pr-4 rounded-r-none')}
        style={{
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
        }}
      />

      <p className={cn('text-2xl -mx-2 text-light-950/50')}>/</p>

      <EditableText
        value={remoteBranch}
        label="Remote branch"
        suggestions={remoteBranchOptions}
        setValue={changeUpstreamBranch}
        placeholder={branch?.type === 'local' ? 'Branch...' : '-'}
        className={cn('pl-5 rounded-l-none flex-1')}
        style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
        }}
        buttonProps={{
          disabled: branch?.type !== 'local',
          variant: 'plain',
          className: cn(
            'text-light-700',
            remoteBranch === undefined && 'text-light-950',
            'pl-5 rounded-l-none flex-1 justify-start',
          ),
          style: {
            clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
          },
        }}
      />

      <ActionButton
        compact
        round
        disabled={!remote}
        className={cn('mx-2')}
        mainAction={{
          Glyph: IconRefresh,
          label: {
            idle: 'Fetch remote',
            running: 'Fetching remote',
            success: 'Remote fetched',
            error: 'Failed',
          },
          run: async () => {
            if (remote) {
              await fetchRemote.mutateAsync({
                remote: remote.name,
              })
            }
          },
        }}
      />

      <Button
        round
        description="Manage remotes"
        onClick={() => {
          showRemotesDialog()
        }}
      >
        <Icon Glyph={IconMenuDeep} />
      </Button>
    </div>
  )
}

export { CurrentRemote, type CurrentRemoteProps }
