import type { ComponentProps } from 'react'
import {
  IconMenuDeep,
  IconWorld,
  IconWorldCancel,
  IconWorldQuestion,
} from '@tabler/icons-react'
import { useInterval } from 'react-use'

import type { BranchName, RemoteName } from '@/api/models'
import { useMakeFetchRemote } from '@/api/mutations/fetchRemote'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryRemotes } from '@/api/queries/remotes'
import { showRemotesDialog } from '@/common/RemotesDialog'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { runAction } from '@/state/actions'
import {
  changeSelectedRemote,
  changeSelectedRemoteBranch,
  useSelectedUpstream,
} from '@/state/upstream'
import { Combobox } from '@/ui/Combobox'
import { ComboboxItem } from '@/ui/Combobox/Item'
import { ComboboxSection } from '@/ui/Combobox/Section'
import { EditableText } from '@/ui/EditableText'
import { useSettings } from '@/utils/app'
import { ensurePresent } from '@/utils/array'
import { useCurrentBranch } from '@/utils/repository'
import { cn, propsWithCn } from '@/utils/styles'
import { MS_IN_MINUTE } from '@/utils/time'

interface CurrentRemoteProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the current remote and remote branch selected for pushing and pulling.
 */
const CurrentRemote = (props: CurrentRemoteProps) => {
  const { ...divProps } = props

  const currentBranch = useCurrentBranch()
  const upstream = useSelectedUpstream(currentBranch)

  const remotesQuery = useQueryRemotes()
  const branchesQuery = useQueryBranches()

  const allRemotes = remotesQuery.data?.map((remote) => remote.name) ?? []
  const remoteOptions: RemoteName[] = upstream?.remote
    ? ensurePresent(allRemotes, upstream.remote, true)
    : allRemotes

  const remoteBranchOptions: BranchName[] = !upstream
    ? []
    : ensurePresent(
        branchesQuery.data
          ?.filter((branch) => branch.type === 'remote')
          .filter((branch) => branch.name.startsWith(`${upstream.remote}/`))
          .map((branch) => branch.name.substring(upstream.remote.length + 1)) ??
          [],
        upstream.remoteBranch,
        true,
      )

  const makeFetchRemote = useMakeFetchRemote()
  const fetchRemote = upstream ? makeFetchRemote(upstream.remote) : undefined

  const settings = useSettings()
  useInterval(() => {
    if (settings.autoFetchRemote && fetchRemote) {
      runAction(fetchRemote)
    }
  }, 1 * MS_IN_MINUTE)

  return (
    <div
      {...propsWithCn(divProps, 'w-full flex flex-row items-center min-w-0')}
    >
      <Combobox
        value={upstream?.remote ?? ''}
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
      >
        <ComboboxSection
          name="remotes"
          options={remoteOptions}
          onSelect={(value) => {
            if (
              currentBranch?.type === 'local' &&
              !!remotesQuery.data?.find((remote) => remote.name === value)
            ) {
              changeSelectedRemote(currentBranch, value)
            }
          }}
          noMatches={(search) => (
            <ComboboxItem
              className={cn('text-light-600 italic')}
              value={search}
              onClick={() => {
                showRemotesDialog({
                  defaultCreating: search,
                  onCreate: (name) => {
                    if (currentBranch?.type === 'local') {
                      changeSelectedRemote(currentBranch, name)
                    }
                  },
                })
              }}
            >
              Create remote <b className={cn('text-light-50')}>{search}</b>
            </ComboboxItem>
          )}
        />
      </Combobox>

      <p className={cn('text-2xl -mx-2 text-light-950/50')}>/</p>

      <EditableText
        value={upstream?.remoteBranch ?? ''}
        label="remote branch"
        suggestions={remoteBranchOptions}
        disabled={currentBranch?.type !== 'local' || !upstream}
        setValue={(newBranch) => {
          if (currentBranch?.type === 'local' && upstream) {
            changeSelectedRemoteBranch(
              currentBranch,
              newBranch ? newBranch : undefined,
            )
          }
        }}
        placeholder={currentBranch?.type === 'local' ? undefined : '-'}
        className={cn('pl-5 rounded-l-none flex-1 h-full')}
        style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
        }}
        buttonProps={{
          disabled: currentBranch?.type !== 'local' || !upstream,
          variant: 'plain',
          className: cn(
            'text-light-700',
            upstream === undefined && 'text-light-950',
            'pl-5 rounded-l-none flex-1 justify-start min-w-0 h-full',
          ),
          style: {
            clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
          },
        }}
      />

      {fetchRemote && (
        <ActionButton
          compact
          round
          className={cn('ml-2')}
          action={fetchRemote}
        />
      )}

      <DecoratedButton
        compact
        round
        className={cn('ml-2')}
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
