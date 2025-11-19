import type { ComponentProps } from 'react'
import {
  IconMenuDeep,
  IconWorld,
  IconWorldCancel,
  IconWorldQuestion,
} from '@tabler/icons-react'

import type { RemoteName } from '@/api/models'
import { useFetchRemote } from '@/api/mutations/fetchRemote'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryRemotes } from '@/api/queries/remotes'
import { showRemotesDialog } from '@/common/RemotesDialog'
import { useSelectedBranches } from '@/context/branches'
import { changeSelectedUpstream, useCurrentUpstream } from '@/context/upstream'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { Combobox, type ComboboxOption } from '@/ui/Combobox'
import { EditableText } from '@/ui/EditableText'
import { cn, propsWithCn } from '@/utils/styles'

interface CurrentRemoteProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the current remote and remote branch selected for pushing and pulling.
 */
const CurrentRemote = (props: CurrentRemoteProps) => {
  const { ...divProps } = props

  const { currentBranch } = useSelectedBranches()
  const upstream = useCurrentUpstream()

  const fetchRemote = useFetchRemote(upstream?.remote)
  const remotesQuery = useQueryRemotes()
  const branchesQuery = useQueryBranches()

  const remoteOptions: ComboboxOption<RemoteName>[] =
    remotesQuery.data?.map((remote) => {
      const option = {
        value: remote.name,
        data: remote.name,
      }
      return option
    }) ?? []

  const remoteBranchOptions = !upstream
    ? []
    : (branchesQuery.data
        ?.filter((branch) => branch.type === 'remote')
        .filter((branch) => branch.name.startsWith(`${upstream.remote}/`))
        .map((branch) => branch.name.substring(upstream.remote.length + 1)) ??
      [])

  return (
    <div
      {...propsWithCn(divProps, 'w-full flex flex-row items-center min-w-0')}
    >
      <Combobox
        option={
          upstream
            ? { value: upstream.remote, data: upstream.remote }
            : undefined
        }
        options={remoteOptions}
        setOption={(newOption) => {
          if (currentBranch?.type === 'local' && upstream) {
            changeSelectedUpstream(currentBranch.name, {
              remote: newOption.value,
              remoteBranch: upstream.remoteBranch,
            })
          }
        }}
        renderOption={(option) => option.value}
        placeholder={currentBranch?.type === 'local' ? 'Remote...' : '-'}
        disabled={!remoteOptions || currentBranch?.type !== 'local'}
        Glyph={
          currentBranch?.type === 'local'
            ? currentBranch.upstream === undefined
              ? IconWorldQuestion
              : IconWorld
            : IconWorldCancel
        }
        status={
          currentBranch?.type === 'local'
            ? upstream === undefined
              ? 'danger'
              : 'primary'
            : 'neutral'
        }
        className={cn('max-w-half -mr-0.5 pr-4 rounded-r-none min-w-0')}
        style={{
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
        }}
      />

      <p className={cn('text-2xl -mx-2 text-light-950/50')}>/</p>

      <EditableText
        value={upstream?.remoteBranch ?? ''}
        label="Remote branch"
        suggestions={remoteBranchOptions}
        setValue={(newValue) => {
          if (currentBranch?.type === 'local' && upstream && newValue) {
            changeSelectedUpstream(currentBranch.name, {
              remote: upstream.remote,
              remoteBranch: newValue,
            })
          }
        }}
        placeholder={currentBranch?.type === 'local' ? 'Branch...' : '-'}
        className={cn('pl-5 rounded-l-none flex-1')}
        style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
        }}
        buttonProps={{
          disabled: currentBranch?.type !== 'local',
          variant: 'plain',
          className: cn(
            'text-light-700',
            upstream === undefined && 'text-light-950',
            'pl-5 rounded-l-none flex-1 justify-start min-w-0',
          ),
          style: {
            clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
          },
        }}
      />

      <ActionButton
        compact
        round
        disabled={!upstream}
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
