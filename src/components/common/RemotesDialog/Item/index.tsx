import type { ComponentProps } from 'react'
import { IconTrash } from '@tabler/icons-react'

import type { RemoteInfo } from '@/api/models'
import {
  useChangeRemoteUrl,
  useRemoveRemote,
  useRenameRemote,
} from '@/api/mutations'
import { ActionButton } from '@/lib/ActionButton'
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

  const removeRemote = useRemoveRemote()
  const renameRemote = useRenameRemote()
  const changeRemoteUrl = useChangeRemoteUrl()

  return (
    <div
      key={remote.name}
      {...propsWithCn(divProps, 'w-full flex flex-row items-stretch')}
    >
      <EditableText
        value={remote.name}
        setValue={(newName) => {
          if (newName) {
            renameRemote.mutateAsync({ name: remote.name, newName })
          }
        }}
        label="Remote Name"
        buttonProps={{
          className: cn('rounded-l-sm rounded-r-none'),
        }}
        className={cn('rounded-l-sm rounded-r-none')}
      />

      <EditableText
        value={remote.fetchUrl}
        setValue={(newUrl) => {
          if (newUrl) {
            changeRemoteUrl.mutateAsync({
              name: remote.name,
              newUrl,
            })
          }
        }}
        label="Remote URL"
        buttonProps={{
          className: cn(
            'justify-start flex-1 rounded-none border-x-1 border-x-dark-600 border-solid',
          ),
        }}
        className={cn(
          'flex-1 rounded-none border-x-1 border-x-dark-600 border-solid',
        )}
      />

      <ActionButton
        mainAction={{
          run: () => removeRemote.mutateAsync({ name: remote.name }),
          Glyph: IconTrash,
          label: {
            idle: 'Remove',
            running: 'Removing',
            success: 'Removed',
            error: 'Failed',
          },
        }}
        compact
        variant="filled"
        status="neutral"
        className={cn('rounded-l-none rounded-r-sm h-auto')}
      />
    </div>
  )
}

export { RemotesDialogItem, type RemotesDialogItemProps }
