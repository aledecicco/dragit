import { useState } from 'react'

import {
  useAddRemote,
  useChangeRemoteUrl,
  useRemoveRemote,
  useRenameRemote,
} from '@api/mutations'
import { useQueryRemotes } from '@api/queries'
import { ActionButton } from '@lib/ActionButton'
import { QueryLoader } from '@lib/Loader/Query'
import { IconTrash } from '@tabler/icons-react'
import { Button } from '@ui/Button'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { EditableText } from '@ui/EditableText'
import { cn } from '@utils/styles'
import { RemoteForm } from './Form'

export const REMOTES_DIALOG_KEY = 'remotes_dialog'

interface RemotesDialogProps extends Omit<DialogProps, 'dialogKey'> {}

const RemotesDialog = (props: RemotesDialogProps) => {
  const { ...dialogProps } = props

  const [adding, setAdding] = useState(false)

  const remotesQuery = useQueryRemotes()
  const addRemote = useAddRemote()
  const removeRemote = useRemoveRemote()
  const renameRemote = useRenameRemote()
  const changeRemoteUrl = useChangeRemoteUrl()

  return (
    <Dialog dialogKey={REMOTES_DIALOG_KEY} heading="Remotes" {...dialogProps}>
      <div className={cn('flex flex-col gap-2')}>
        <QueryLoader query={remotesQuery}>
          {(remotes) => (
            <>
              {remotes.map((remote) => (
                <div
                  key={remote.name}
                  className={cn('w-full flex flex-row items-stretch')}
                >
                  <EditableText
                    value={remote.name}
                    setValue={(newName) => {
                      if (newName) {
                        renameRemote.mutateAsync({ name: remote.name, newName })
                      }
                    }}
                    label="Remote name"
                    buttonProps={{
                      className: cn('rounded-r-none'),
                    }}
                    className={cn('rounded-r-none')}
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
                      className: cn('justify-start flex-1 rounded-none'),
                    }}
                    className={cn('flex-1 rounded-none')}
                  />
                  <ActionButton
                    mainAction={{
                      run: () =>
                        removeRemote.mutateAsync({ name: remote.name }),
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
                    className={cn('rounded-l-none h-auto')}
                  />
                </div>
              ))}

              {adding ? (
                <RemoteForm
                  onCancel={() => {
                    setAdding(false)
                  }}
                  defaultValues={{ name: '', url: '' }}
                  onFormSubmit={(formState) => {
                    if (formState.values.name && formState.values.url) {
                      addRemote.mutateAsync({
                        name: formState.values.name,
                        url: formState.values.url,
                      })

                      setAdding(false)
                    }
                  }}
                />
              ) : (
                <Button
                  status="primary"
                  className={cn('w-full')}
                  onClick={() => {
                    setAdding(true)
                  }}
                >
                  Create
                </Button>
              )}
            </>
          )}
        </QueryLoader>
      </div>
    </Dialog>
  )
}

export { RemotesDialog, type RemotesDialogProps }
