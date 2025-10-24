import type { ComponentProps } from 'react'
import {
  IconMenuDeep,
  IconWorld,
  IconWorldCancel,
  IconWorldQuestion,
} from '@tabler/icons-react'

import type { RemoteInfo } from '@/api/models'
import { useFetchRemote } from '@/api/mutations/fetchRemote'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryRemotes } from '@/api/queries/remotes'
import { showRemotesDialog } from '@/common/RemotesDialog'
import {
  changeUpstreamBranch,
  changeUpstreamRemote,
  useSelectedUpstream,
} from '@/context/upstream'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { Combobox, type ComboboxOption } from '@/ui/Combobox'
import { EditableText } from '@/ui/EditableText'
import { useSelectedBranches } from '@/utils/repository'
import { cn, propsWithCn } from '@/utils/styles'

interface CurrentRemoteProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the current remote and remote branch selected for pushing and pulling.
 */
const CurrentRemote = (props: CurrentRemoteProps) => {
  const { ...divProps } = props

  const { branch } = useSelectedBranches()
  const { remote, remoteBranch } = useSelectedUpstream()

  const fetchRemote = useFetchRemote(remote?.name)
  const remotesQuery = useQueryRemotes()
  const branchesQuery = useQueryBranches()

  const remoteOptions: ComboboxOption<RemoteInfo>[] =
    remotesQuery.data?.map((remote) => {
      const option = {
        value: remote.name,
        data: remote,
      }
      return option
    }) ?? []

  const remoteBranchOptions = !remote
    ? []
    : (branchesQuery.data
        ?.filter((branch) => branch.type === 'remote')
        .filter((branch) => branch.name.startsWith(`${remote.name}/`))
        .map((branch) => branch.name.substring(remote.name.length + 1)) ?? [])

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
        className={cn('max-w-half -mr-0.5 pr-4 rounded-r-none')}
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
        mainAction={fetchRemote}
      />

      <DecoratedButton
        compact
        round
        label="Manage remotes"
        Glyph={IconMenuDeep}
        onClick={() => {
          showRemotesDialog()
        }}
      />
    </div>
  )
}

export { CurrentRemote, type CurrentRemoteProps }
