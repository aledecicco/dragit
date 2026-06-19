import type { ComponentProps } from 'react'

import type { RemoteInfo } from '@/api/models'
import {
  useChangeRemoteUrlInteraction,
  useRemoveRemoteInteraction,
  useRenameRemoteInteraction,
} from '@/interactions/remote'
import { ActionButton } from '@/lib/ActionButton'
import { triggerInteraction } from '@/state/actions'
import { EditableText } from '@/ui/EditableText'
import { cn, propsWithCn } from '@/utils/styles'

interface RemotesDialogItemProps extends ComponentProps<'div'> {
  /**
   * The remote that this list item should display.
   */
  remote: RemoteInfo
}

/**
 * The list item for remotes in the remotes dialog.
 *
 * The fields are displayed as editable text fields.
 */
const RemotesDialogItem = (props: RemotesDialogItemProps) => {
  const { remote, ...divProps } = props

  const renameRemote = useRenameRemoteInteraction(remote)
  const changeRemoteUrl = useChangeRemoteUrlInteraction(remote)
  const removeRemote = useRemoveRemoteInteraction(remote)

  return (
    <div
      key={remote.name}
      {...propsWithCn(divProps, 'w-full flex flex-row items-stretch')}
    >
      <EditableText
        value={remote.name}
        setValue={(newName) => {
          if (newName) {
            triggerInteraction(renameRemote(newName))
          }
        }}
        label="remote name"
        className={cn('pr-4 -mr-2.5 rounded-r-none w-half')}
        style={{
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
        }}
        buttonProps={{
          className: cn(
            'pr-4 -mr-2.5 rounded-r-none max-w-half justify-start min-w-0',
          ),
          style: {
            clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
          },
        }}
      />

      <EditableText
        value={remote.fetchUrl}
        setValue={(newUrl) => {
          if (newUrl) {
            triggerInteraction(changeRemoteUrl(newUrl))
          }
        }}
        label="remote URL"
        className={cn('pl-5 rounded-none flex-1 mx-px')}
        style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
        }}
        buttonProps={{
          className: cn('pl-5 rounded-none flex-1 mx-px justify-start min-w-0'),
          style: {
            clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)',
          },
        }}
      />

      <ActionButton
        {...removeRemote}
        status="neutral"
        variant="filled"
        className={cn('rounded-l-none rounded-r-sm h-auto')}
        compact
      />
    </div>
  )
}

export { RemotesDialogItem, type RemotesDialogItemProps }
